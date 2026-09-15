import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { bookings, coupons, query, rates, saveBooking, settings, transaction } from './db';
import { airbnbDates, assertAvailable } from './calendar';
import { BookingError, integer, nightsBetween, requireValue, textValue, validDate, validateInput } from './validation';
import { dateLabel, money, today, type Booking, type Coupon, type Quote, type RequestInput, type Status } from './types';

export async function calculateQuote(start: string, end: string, code = ''): Promise<Quote> {
  const config = await settings();
  requireValue(config.enabled && config.nightly > 0, 'As reservas diretas ainda não estão abertas. Entre em contato pelo WhatsApp.');
  requireValue(start >= today(), 'O check-in não pode estar no passado.');
  requireValue(typeof code === 'string' && code.length <= 40, 'Cupom inválido.');
  const periods = await rates();
  const nights = nightsBetween(start, end).map(date => ({ date, amount: periods.find(rate => rate.start <= date && date < rate.end)?.nightly ?? config.nightly }));
  const lodging = nights.reduce((sum, night) => sum + night.amount, 0);
  const subtotal = lodging + config.cleaning;
  const couponCode = code.trim().toUpperCase();
  let discount = 0;
  if (couponCode) {
    const coupon = (await coupons()).find(c => c.code === couponCode);
    requireValue(coupon && coupon.active, 'Cupom inválido ou desativado.');
    requireValue(coupon.start <= today() && today() <= coupon.end, 'Cupom fora do período de validade.');
    requireValue(coupon.limit === 0 || coupon.uses < coupon.limit, 'O cupom atingiu o limite de utilizações.');
    discount = Math.min(subtotal, coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : coupon.value);
  }
  const total = subtotal - discount;
  const values = { nights, lodging, cleaning: config.cleaning, discount, total, deposit: Math.round(total * config.depositPercent / 100), coupon: couponCode };
  return { ...values, token: createHash('sha256').update(JSON.stringify(values)).digest('hex') };
}
export function whatsappMessage(booking: Booking) {
  const { input: i, quote: q } = booking;
  return `Olá! Gostaria de solicitar uma reserva no Sítio Cangumbim.\n\nPERÍODO\nCheck-in: ${dateLabel(i.checkIn)}\nCheck-out: ${dateLabel(i.checkOut)}\nQuantidade de diárias: ${q.nights.length}\n\nHÓSPEDES\n${i.adults} adultos\n${i.children} crianças\n${i.adults + i.children} hóspedes no total\nPets: ${i.pets}\n\nRESPONSÁVEL\nNome: ${i.responsible.name}\nCPF: ${i.responsible.cpf}\nData de nascimento: ${dateLabel(i.responsible.birthDate)}\nWhatsApp: ${i.responsible.phone}\nE-mail: ${i.responsible.email}\n\nDEMAIS HÓSPEDES\n${i.guests.length ? i.guests.map((g, index) => `${index + 1}. ${g.name} — ${g.cpf} — ${dateLabel(g.birthDate)}`).join('\n') : 'Sem demais hóspedes'}\n\nVALORES\n${q.nights.map(n => `${dateLabel(n.date)}: ${money(n.amount)}`).join('\n')}\nDiárias: ${money(q.lodging)}\nTaxa de limpeza: ${money(q.cleaning)}${q.coupon ? `\nCupom: ${q.coupon}\nDesconto: -${money(q.discount)}` : ''}\nTOTAL: ${money(q.total)}\nSinal previsto: ${money(q.deposit)}\nRestante no check-in: ${money(q.total - q.deposit)}\n\nSolicitação nº ${booking.id}\n\nAguardo a confirmação da disponibilidade e as orientações para pagamento do sinal. A solicitação não bloqueia as datas; a reserva depende do sinal e da confirmação pelo Sítio Cangumbim.`;
}
async function receipt(booking: Booking) { return { id: booking.id, status: booking.status, whatsappUrl: `https://wa.me/${(await settings()).whatsapp}?text=${encodeURIComponent(whatsappMessage(booking))}` }; }
export async function createRequest(raw: RequestInput) {
  const input = validateInput(raw, (await settings()).maxGuests);
  // Network I/O precedes the write lock. All local checks and writes remain atomic.
  const external = await airbnbDates();
  return transaction(async () => {
    const existing = (await query<{ data: Booking }>('SELECT data FROM bookings WHERE request_key=$1', [input.idempotencyKey])).rows[0];
    if (existing) {
      const booking = existing.data;
      // JSONB does not preserve object key order.
      requireValue(isDeepStrictEqual(booking.input, input), 'A solicitação já foi enviada com outros dados.');
      return receipt(booking);
    }
    validateInput(input, (await settings()).maxGuests);
    await assertAvailable(input.checkIn, input.checkOut, external);
    const quote = await calculateQuote(input.checkIn, input.checkOut, input.coupon);
    if (quote.token !== input.quoteToken) throw new BookingError('Os valores mudaram. Volte ao resumo para atualizar a cotação.', 409);
    const now = new Date().toISOString();
    const booking: Booking = { id: `SC-${today().slice(0, 4)}-${randomUUID().slice(0, 8).toUpperCase()}`, status: 'PENDENTE', input, quote, createdAt: now, updatedAt: now, history: [{ at: now, status: 'PENDENTE', actor: 'Solicitação pelo site; consentimento v1 aceito' }] };
    await query('INSERT INTO bookings (id, request_key, status, check_in, check_out, data, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)', [booking.id, input.idempotencyKey, booking.status, input.checkIn, input.checkOut, booking, now]);
    if (quote.coupon) {
      const coupon = (await coupons()).find(c => c.code === quote.coupon)!;
      coupon.uses++;
      await query('UPDATE coupons SET data=$1 WHERE code=$2', [coupon, coupon.code]);
    }
    return receipt(booking);
  });
}
export async function changeStatus(id: string, status: Status, payment?: Booking['payment'], received?: boolean) {
  const external = status === 'CONFIRMADA' ? await airbnbDates() : [];
  return transaction(async () => {
    const booking = (await bookings()).find(b => b.id === id);
    if (!booking) throw new BookingError('Solicitação não encontrada.', 404);
    const transitions: Record<Status, Status[]> = { PENDENTE: ['AGUARDANDO_SINAL', 'CANCELADA'], AGUARDANDO_SINAL: ['CONFIRMADA', 'CANCELADA'], CONFIRMADA: ['CANCELADA', 'FINALIZADA'], CANCELADA: [], FINALIZADA: [] };
    requireValue(transitions[booking.status].includes(status), 'Essa alteração de status não é permitida. Atualize o painel.');
    const now = new Date().toISOString();
    if (status === 'CONFIRMADA') {
      requireValue(booking.input.checkIn >= today(), 'Não é possível confirmar uma reserva com entrada no passado.');
      await assertAvailable(booking.input.checkIn, booking.input.checkOut, external, id);
      requireValue(received === true && payment && integer(payment.amount, booking.quote.total === 0 ? 0 : 1, booking.quote.total), 'Confirme o recebimento e informe um sinal válido, até o valor total.');
      requireValue(validDate(payment.date) && payment.date <= today(), 'Informe uma data de pagamento válida.');
      requireValue(textValue(payment.method, 2, 50) && typeof payment.note === 'string' && payment.note.length <= 1000, 'Informe a forma de pagamento e uma observação de até 1.000 caracteres.');
      booking.payment = { amount: payment.amount, date: payment.date, method: payment.method.trim(), note: payment.note.trim() };
      booking.confirmedAt = now;
    }
    if (status === 'FINALIZADA') requireValue(booking.input.checkOut <= today(), 'Finalize a reserva somente após a data de check-out.');
    booking.status = status;
    booking.updatedAt = now;
    booking.history.push({ at: now, status, actor: status === 'CONFIRMADA' ? 'Administrador confirmou o recebimento do sinal' : 'Administrador' });
    await saveBooking(booking);
    return booking;
  });
}
export async function saveConfiguration(data: Record<string, unknown>) {
  return transaction(async () => {
    if (data.kind === 'settings') {
      const s = data.value as Awaited<ReturnType<typeof settings>>;
      requireValue(s && typeof s.enabled === 'boolean' && integer(s.nightly, s.enabled ? 1 : 0, 100000000) && integer(s.cleaning, 0, 100000000) && integer(s.depositPercent, 1, 100) && integer(s.maxGuests, 1, 10), 'Confira os preços, o sinal (1–100%) e a capacidade (até 10 hóspedes).');
      requireValue(typeof s.whatsapp === 'string' && /^\d{10,15}$/.test(s.whatsapp), 'WhatsApp deve conter país, DDD e número.');
      requireValue(typeof s.privacyUrl === 'string' && (s.privacyUrl === '' || /^https:\/\/[^\s]+$/.test(s.privacyUrl)), 'Use uma URL HTTPS para a política de privacidade.');
      await query('UPDATE settings SET data=$1 WHERE id=1', [{ enabled: s.enabled, nightly: s.nightly, cleaning: s.cleaning, depositPercent: s.depositPercent, maxGuests: s.maxGuests, whatsapp: s.whatsapp, privacyUrl: s.privacyUrl }]);
    } else if (data.kind === 'rate') {
      const r = data.value as Awaited<ReturnType<typeof rates>>[number];
      requireValue(r && textValue(r.name, 2, 80) && validDate(r.start) && validDate(r.end) && r.start < r.end && integer(r.nightly, 1, 100000000), 'Confira o nome, período e valor da tarifa.');
      requireValue(!(await rates()).some(other => other.id !== r.id && other.start < r.end && other.end > r.start), 'O período sobrepõe outra tarifa especial.');
      const rate = { id: typeof r.id === 'string' && r.id ? r.id : randomUUID(), name: r.name.trim(), start: r.start, end: r.end, nightly: r.nightly };
      await query('INSERT INTO rates (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data', [rate.id, rate]);
    } else if (data.kind === 'deleteRate') {
      requireValue(textValue(data.id), 'Tarifa inválida.');
      await query('DELETE FROM rates WHERE id=$1', [data.id]);
    } else if (data.kind === 'coupon') {
      const c = data.value as Coupon;
      requireValue(c && typeof c.code === 'string' && /^[A-Z0-9_-]{2,40}$/.test(c.code.toUpperCase()) && ['percent', 'fixed'].includes(c.type) && integer(c.value, 1, c.type === 'percent' ? 100 : 100000000) && integer(c.limit, 0, 1000000) && typeof c.active === 'boolean' && validDate(c.start) && validDate(c.end) && c.start <= c.end, 'Confira o código, valor, validade e limite do cupom.');
      const previous = (await coupons()).find(item => item.code === c.code.toUpperCase());
      const coupon = { code: c.code.toUpperCase(), type: c.type, value: c.value, start: c.start, end: c.end, limit: c.limit, active: c.active, uses: previous?.uses ?? 0 };
      await query('INSERT INTO coupons (code, data) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET data=EXCLUDED.data', [coupon.code, coupon]);
    } else throw new BookingError('Configuração inválida.');
  });
}
