'use client';
import { useEffect, useRef, useState } from 'react';
import { Calendar } from './reservations/Calendar';
import { Field, GuestFields, PriceSummary } from './reservations/Fields';
import { api } from '@/lib/booking/client';
import { dateLabel, today, type CalendarData, type Guest, type Quote, type RequestInput } from '@/lib/booking/types';
import { ageAt, validCpf, validDate } from '@/lib/booking/validation';
import { DollarSign, X } from 'lucide-react';
const emptyGuest = (): Guest => ({ name: '', cpf: '', birthDate: '' });
const steps = ['Datas', 'Hóspedes', 'Responsável', 'Demais hóspedes', 'Resumo'];
export const BookingCalendar = () => {
  const [calendar, setCalendar] = useState<CalendarData>();
  const [config, setConfig] = useState<{ enabled: boolean; maxGuests: number; privacyUrl: string }>();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<RequestInput>({ checkIn: '', checkOut: '', adults: 1, children: 0, pets: 0, responsible: { ...emptyGuest(), phone: '', email: '' }, guests: [], coupon: '', consent: false, idempotencyKey: '', quoteToken: '' });
  const [quote, setQuote] = useState<Quote>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; whatsappUrl: string }>();
  const [couponDraft, setCouponDraft] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const submitLock = useRef(false);
  async function load() {
    setError(''); setBusy(true);
    try { const [c, s] = await Promise.all([api<CalendarData>('/api/calendar'), api<NonNullable<typeof config>>('/api/booking')]); setCalendar(c); setConfig(s); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  useEffect(() => { void load(); setInput(i => ({ ...i, idempotencyKey: crypto.randomUUID() })); }, []);
  function update(value: Partial<RequestInput>) { setInput(i => ({ ...i, ...value })); if ('checkIn' in value || 'checkOut' in value || 'coupon' in value) setQuote(undefined); }
  function select(day: string) {
    if (!input.checkIn || input.checkOut || day <= input.checkIn) update({ checkIn: day, checkOut: '' });
    else update({ checkOut: day });
  }
  async function refreshQuote(coupon = input.coupon) {
    const q = await api<Quote>('/api/booking', { action: 'quote', checkIn: input.checkIn, checkOut: input.checkOut, coupon });
    setQuote(q); setInput(i => ({ ...i, coupon, quoteToken: q.token })); return q;
  }
  async function applyCoupon() { const code = couponDraft.trim().toUpperCase(); if (!code) return; const coupons = [...new Set([...input.coupon.split(',').filter(Boolean), code])].join(','); setBusy(true); setError(''); try { await refreshQuote(coupons); setCouponDraft(''); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  async function removeCoupon(code: string) { const coupons = input.coupon.split(',').filter(item => item && item !== code).join(','); setBusy(true); setError(''); try { await refreshQuote(coupons); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  function validateGuest(guest: Guest, label: string) {
    if (guest.name.trim().length < 3 || !guest.name.trim().includes(' ')) throw new Error(`Informe o nome completo de ${label}.`);
    if (!validCpf(guest.cpf)) throw new Error(`O CPF de ${label} é inválido.`);
    if (!validDate(guest.birthDate) || guest.birthDate > today() || ageAt(guest.birthDate, today()) > 120) throw new Error(`Confira a data de nascimento de ${label}.`);
  }
  function validateResponsible() {
    validateGuest(input.responsible, 'responsável');
    if (ageAt(input.responsible.birthDate, today()) < 18) throw new Error('O responsável deve ter pelo menos 18 anos.');
    if (!/^\+?[\d\s()-]+$/.test(input.responsible.phone) || !/^\d{10,15}$/.test(input.responsible.phone.replace(/\D/g, ''))) throw new Error('Informe um telefone válido para o responsável.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.responsible.email)) throw new Error('Informe um e-mail válido para o responsável.');
  }
  function validateGuests() {
    if (input.guests.length !== input.adults + input.children - 1) throw new Error('Adicione os dados de todos os demais hóspedes.');
    input.guests.forEach((guest, index) => validateGuest(guest, `o hóspede ${index + 2}`));
    const cpfs = [input.responsible, ...input.guests].map(guest => guest.cpf.replace(/\D/g, ''));
    if (new Set(cpfs).size !== cpfs.length) throw new Error('Há CPFs repetidos entre o responsável e os hóspedes.');
  }
  async function next() {
    setError(''); setBusy(true);
    try {
      if (step === 1 && input.adults + input.children > (config?.maxGuests ?? 8)) throw new Error(`A capacidade é de ${config?.maxGuests ?? 8} hóspedes.`);
      if (step === 2) validateResponsible();
      if (step === 3) validateGuests();
      if (step === 0 || step === 3) await refreshQuote();
      setStep(s => s + 1); setTimeout(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 0);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function submit() {
    if (submitLock.current) return;
    submitLock.current = true; setBusy(true); setError('');
    try {
      const result = await api<NonNullable<typeof receipt>>('/api/booking', input);
      setReceipt(result);
      window.location.assign(result.whatsappUrl);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); submitLock.current = false; }
  }
  return <section id="reservas" className="py-20 bg-green-900 text-white"><div className="container mx-auto px-4 max-w-6xl">
    <div className="mb-10 max-w-2xl"><p className="text-green-200 uppercase tracking-widest text-xs mb-3">Sua próxima pausa começa aqui</p><h2 className="text-3xl md:text-5xl font-serif font-bold">Planeje seu descanso</h2><p className="mt-5 text-green-100 text-lg">Escolha suas datas e envie uma solicitação. A reserva será confirmada somente após o pagamento do sinal e a confirmação pelo Sítio Cangumbim.</p></div>
    {receipt ? <div className="bg-white text-green-950 rounded-2xl p-8 space-y-5"><h3 className="font-serif text-2xl">Solicitação recebida!</h3><p>Número {receipt.id} · Pendente</p><p>As datas ainda não estão bloqueadas. Continue pelo WhatsApp para combinar o sinal.</p><a className="reservation-button inline-block" href={receipt.whatsappUrl} rel="noreferrer">Continuar no WhatsApp</a></div> : <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
      <div className="space-y-5">{calendar ? <Calendar data={calendar} start={input.checkIn} end={input.checkOut} onSelect={step === 0 && !busy ? select : undefined} /> : <div className="rounded-2xl bg-white/10 p-8">{busy ? 'Consultando disponibilidade…' : 'Calendário indisponível.'}<button className="block mt-3 underline" onClick={load} disabled={busy}>Tentar novamente</button></div>}{quote && <PriceSummary quote={quote} />}</div>
      <div className="bg-white text-gray-800 rounded-2xl p-5 sm:p-8 shadow-xl">
        <ol className="flex flex-wrap gap-2 mb-7 text-xs" aria-label="Etapas da solicitação">{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`rounded-full px-3 py-2 ${step === index ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{index + 1}. {label}</li>)}</ol>
        <h3 ref={heading} tabIndex={-1} className="font-serif text-2xl mb-5">{steps[step]}</h3>
        {config && !config.enabled && <p className="mb-5 rounded-xl bg-orange-50 p-4">As solicitações pelo site ainda não estão abertas. <a className="underline" href="https://wa.me/5532999943917">Fale conosco pelo WhatsApp.</a></p>}
        <form onSubmit={e => { e.preventDefault(); void (step === 4 ? submit() : next()); }} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
          {step === 0 && <><div className="grid sm:grid-cols-2 gap-4"><Field label="Check-in" type="date" min={today()} required value={input.checkIn} onChange={e => update({ checkIn: e.target.value, checkOut: '' })} /><Field label="Check-out" type="date" min={input.checkIn || today()} required value={input.checkOut} onChange={e => update({ checkOut: e.target.value })} /></div><p className="text-sm text-gray-600">Selecione no calendário ou preencha as datas. Verificaremos todas as noites do período.</p></>}
          {step === 1 && <><p>Até {config?.maxGuests ?? 8} pessoas. Pets são bem-vindos.</p><div className="grid sm:grid-cols-3 gap-4"><Field label="Adultos (18+)" type="number" required min={1} max={config?.maxGuests ?? 8} value={input.adults} onChange={e => update({ adults: Number(e.target.value) })} /><Field label="Crianças (menores de 18)" type="number" required min={0} max={7} value={input.children} onChange={e => update({ children: Number(e.target.value) })} /><Field label="Pets" type="number" min={0} max={10} required value={input.pets} onChange={e => update({ pets: Number(e.target.value) })} /></div><p>Total: {input.adults + input.children} hóspedes, incluindo o responsável. Considere a idade no check-in.</p></>}
          {step === 2 && <><GuestFields value={input.responsible} onChange={g => update({ responsible: { ...input.responsible, ...g } })} /><div className="grid sm:grid-cols-2 gap-4"><Field label="WhatsApp / telefone" type="tel" autoComplete="tel" placeholder="(32) 99999-9999" required maxLength={20} value={input.responsible.phone} onChange={e => update({ responsible: { ...input.responsible, phone: e.target.value } })} /><Field label="E-mail" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength={254} value={input.responsible.email} onChange={e => update({ responsible: { ...input.responsible, email: e.target.value } })} /></div><p className="text-sm text-gray-600">O responsável deve ter pelo menos 18 anos.</p></>}
          {step === 3 && <><p>{input.guests.length} de {input.adults + input.children - 1} demais hóspedes cadastrados.</p>{input.guests.map((g, index) => <div key={index} className="border rounded-xl p-4 space-y-3"><div className="flex justify-between"><h4>Hóspede {index + 2}</h4><button type="button" className="text-red-700 underline" onClick={() => update({ guests: input.guests.filter((_, idx) => idx !== index) })}>Remover hóspede {index + 2}</button></div><GuestFields value={g} onChange={value => update({ guests: input.guests.map((item, idx) => idx === index ? value : item) })} /></div>)}{input.guests.length < input.adults + input.children - 1 && <button type="button" className="reservation-secondary" onClick={() => update({ guests: [...input.guests, emptyGuest()] })}>+ Adicionar hóspede</button>}<p className="text-sm text-gray-500">Informe CPF e nascimento também para menores de idade.</p></>}
          {step === 4 && <><div className="space-y-2"><p><strong>{dateLabel(input.checkIn)} → {dateLabel(input.checkOut)}</strong></p><p>{input.adults} adultos · {input.children} crianças · {input.pets} pets</p><h4 className="font-bold pt-2">Responsável</h4><p>{input.responsible.name}<br />CPF: {input.responsible.cpf} · {dateLabel(input.responsible.birthDate)}<br />{input.responsible.phone}<br />{input.responsible.email}</p>{input.guests.map((g, i) => <p key={i} className="text-sm">{g.name} · {g.cpf} · {dateLabel(g.birthDate)}</p>)}</div><div className="space-y-3"><div className="flex flex-col sm:flex-row sm:items-end gap-2"><div className="flex-1"><Field label="Adicionar cupom de desconto" maxLength={40} value={couponDraft} onChange={e => setCouponDraft(e.target.value.toUpperCase())} /></div><button type="button" className="reservation-coupon" onClick={() => void applyCoupon()} disabled={busy || !couponDraft.trim()}><DollarSign size={18} aria-hidden="true" />Aplicar cupom</button></div>{input.coupon && <div className="flex flex-wrap gap-2" aria-label="Cupons aplicados">{input.coupon.split(',').map(code => <span key={code} className="coupon-chip">{code}<button type="button" title={`Remover ${code}`} aria-label={`Remover cupom ${code}`} onClick={() => void removeCoupon(code)} disabled={busy}><X size={14} /></button></span>)}</div>}</div><p className="text-xs text-gray-500">Cupons acumulativos podem ser combinados entre si. Cupons individuais precisam ser usados sozinhos.</p>{quote && <PriceSummary quote={quote} />}<label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={input.consent} onChange={e => update({ consent: e.target.checked })} className="mt-1 h-5 w-5 shrink-0 accent-green-800" /><span>Autorizo o Sítio Cangumbim a utilizar os dados informados para tratar minha solicitação de hospedagem, realizar o cadastro dos hóspedes e entrar em contato sobre a reserva. Após salvar, os dados serão incluídos na mensagem do WhatsApp.</span></label>{config?.privacyUrl && <a href={config.privacyUrl} target="_blank" rel="noreferrer" className="block underline text-sm">Política de Privacidade</a>}<p className="rounded-xl bg-orange-50 p-4 text-sm">Enviar esta solicitação não garante nem bloqueia as datas. O pagamento do sinal será combinado diretamente com o sítio, e a confirmação será feita pelo administrador.</p></>}
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
          <div className="flex flex-wrap gap-3">{step > 0 && <button type="button" disabled={busy} className="reservation-secondary" onClick={() => { setStep(s => s - 1); setError(''); }}>Voltar</button>}<button disabled={busy || !calendar || !config?.enabled || (step === 4 && !quote)} className="reservation-button flex-1">{busy ? 'Aguarde…' : step === 4 ? 'Solicitar reserva' : step === 0 ? 'Consultar disponibilidade' : 'Continuar'}</button></div>
        </form>
      </div>
    </div>}
  </div></section>;
};
