'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/booking/client';
import { dateLabel, money, statusLabels, today, type Booking, type CalendarData, type Coupon, type Rate, type Settings, type Status } from '@/lib/booking/types';
import { Calendar } from './Calendar';
import { Field, PriceSummary } from './Fields';
import { ConfigurationForms } from './ConfigurationForms';
type Data = { bookings: Booking[]; settings: Settings; rates: Rate[]; coupons: Coupon[] };
function pendingDates(bookings: Booking[]) {
  const dates = new Set<string>();
  for (const b of bookings.filter(b => ['PENDENTE', 'AGUARDANDO_SINAL'].includes(b.status))) {
    for (let d = Date.parse(b.input.checkIn); d < Date.parse(b.input.checkOut); d += 86400000) dates.add(new Date(d).toISOString().slice(0, 10));
  }
  return [...dates];
}
export function AdminPanel() {
  const [data, setData] = useState<Data>();
  const [calendar, setCalendar] = useState<CalendarData>();
  const [calendarError, setCalendarError] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);
  const [tab, setTab] = useState('Solicitações');
  const [filter, setFilter] = useState('TODAS');
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [received, setReceived] = useState(false);
  const [payment, setPayment] = useState({ amount: 0, date: today(), method: 'PIX', note: '' });
  async function loadCalendar() {
    try { setCalendar(await api<CalendarData>('/api/calendar')); setCalendarError(''); }
    catch (e) { setCalendar(undefined); setCalendarError((e as Error).message); }
  }
  async function refresh() { setData(await api<Data>('/api/admin')); await loadCalendar(); }
  useEffect(() => {
    api<Data>('/api/admin').then(value => { setData(value); void loadCalendar(); }).catch(e => { if (!(e as Error).message.includes('Entre no painel')) setError((e as Error).message); }).finally(() => setBusy(false));
  }, []);
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await action(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  const booking = data?.bookings.find(b => b.id === selected);
  async function status(value: Status) {
    await api('/api/admin', { action: 'status', id: selected, status: value, ...(value === 'CONFIRMADA' ? { payment, received } : {}) });
    setConfirming(false); setReceived(false); await refresh(); setNotice('Status atualizado com sucesso.');
  }
  const upcoming = data?.bookings.filter(b => b.status === 'CONFIRMADA') ?? [];
  return <main className="min-h-screen bg-stone-50 text-gray-800"><header className="bg-green-900 text-white"><div className="max-w-7xl mx-auto p-5 flex flex-wrap justify-between gap-4 items-center"><div><a href="/" className="font-serif text-2xl">Sítio Cangumbim</a><p className="text-green-200 text-sm">Administração de reservas</p></div>{data && <button disabled={busy} className="underline" onClick={() => void run(async () => { await api('/api/admin', { action: 'logout' }); setData(undefined); setSelected(''); setCalendar(undefined); })}>Sair</button>}</div></header>
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {error && <p role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">{error}</p>}{notice && <p role="status" className="bg-green-100 rounded-xl p-4">{notice}</p>}
      {!data ? <form className="max-w-md mx-auto my-16 rounded-2xl bg-white shadow p-7 space-y-5" onSubmit={e => { e.preventDefault(); void run(async () => { await api('/api/admin', { action: 'login', password }); setPassword(''); await refresh(); }); }}><h1 className="font-serif text-3xl">Acesso do proprietário</h1><Field label="Senha" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /><button className="reservation-button w-full" disabled={busy}>{busy ? 'Aguarde…' : 'Entrar'}</button></form> : <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[
          ['Pendentes', data.bookings.filter(b => b.status === 'PENDENTE').length],
          ['Aguardando sinal', data.bookings.filter(b => b.status === 'AGUARDANDO_SINAL').length],
          ['Confirmadas', upcoming.length],
          ['Valor de confirmadas e finalizadas', money(data.bookings.filter(b => ['CONFIRMADA', 'FINALIZADA'].includes(b.status)).reduce((s, b) => s + b.quote.total, 0))],
        ].map(([label, value]) => <div key={label} className="rounded-2xl bg-white border p-5"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-bold text-green-900 mt-2">{value}</p></div>)}</div>
        <div className="grid md:grid-cols-2 gap-4">{(['checkIn', 'checkOut'] as const).map(key => <div key={key} className="rounded-xl bg-white border p-4"><h2 className="font-semibold mb-2">Próximos {key === 'checkIn' ? 'check-ins' : 'check-outs'}</h2>{upcoming.filter(b => b.input[key] >= today()).sort((a, b) => a.input[key].localeCompare(b.input[key])).slice(0, 5).map(b => <button key={b.id} className="block text-sm underline py-1" onClick={() => { setSelected(b.id); setTab('Solicitações'); }}>{dateLabel(b.input[key])} · {b.input.responsible.name} · {b.id}</button>)}{!upcoming.some(b => b.input[key] >= today()) && <p className="text-sm text-gray-500">Nenhum agendado.</p>}</div>)}</div>
        <nav className="flex flex-wrap gap-2" aria-label="Seções administrativas">{['Solicitações', 'Calendário', 'Tarifas e configurações', 'Cupons'].map(label => <button key={label} className={tab === label ? 'reservation-button' : 'reservation-secondary'} onClick={() => setTab(label)}>{label}</button>)}<button className="reservation-secondary" disabled={busy} onClick={() => void run(refresh)}>Atualizar</button></nav>
        {tab === 'Calendário' && <div className="max-w-xl"><p className="mb-4">Pendentes e aguardando sinal aparecem em amarelo e permitem novas solicitações.</p>{calendarError ? <p role="alert">{calendarError}</p> : calendar ? <Calendar data={calendar} pending={pendingDates(data.bookings)} /> : <p>Carregando calendário…</p>}</div>}
        {tab === 'Solicitações' && <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start"><section className="bg-white rounded-2xl border p-5 space-y-4"><h1 className="text-2xl font-serif">Solicitações e reservas</h1><label className="block text-sm">Filtrar por status<select className="reservation-input mt-1" value={filter} onChange={e => setFilter(e.target.value)}><option value="TODAS">Todas</option>{Object.entries(statusLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label><div className="space-y-2 max-h-[700px] overflow-auto">{data.bookings.filter(b => filter === 'TODAS' || b.status === filter).map(b => <button key={b.id} className={`text-left w-full rounded-xl border p-4 ${selected === b.id ? 'border-green-800 bg-green-50' : 'hover:bg-stone-50'}`} onClick={() => { setSelected(b.id); setConfirming(false); setReceived(false); setError(''); }}><div className="flex flex-wrap gap-2 justify-between"><strong>{b.id}</strong><span className="text-xs rounded-full bg-gray-100 px-2 py-1">{statusLabels[b.status]}</span></div><p className="mt-2">{b.input.responsible.name}</p><p className="text-sm text-gray-500">{dateLabel(b.input.checkIn)} → {dateLabel(b.input.checkOut)}</p><p className="mt-2 text-green-900">{money(b.quote.total)}</p></button>)}{!data.bookings.some(b => filter === 'TODAS' || b.status === filter) && <p className="py-8 text-gray-500">Nenhuma solicitação neste status.</p>}</div></section>
          <section className="bg-white rounded-2xl border p-5 sm:p-7 space-y-5 min-w-0">{booking ? <><div><h2 className="font-serif text-2xl">{booking.id}</h2><p>{statusLabels[booking.status]}</p><p className="text-xs text-gray-500 mt-2">Criada em {new Date(booking.createdAt).toLocaleString('pt-BR')}<br />Atualizada em {new Date(booking.updatedAt).toLocaleString('pt-BR')}</p></div><p>{dateLabel(booking.input.checkIn)} → {dateLabel(booking.input.checkOut)}<br />{booking.quote.nights.length} diárias · {booking.input.adults} adultos · {booking.input.children} crianças · {booking.input.pets} pets</p><div className="break-words"><h3 className="font-bold mb-2">Responsável</h3><p>{booking.input.responsible.name}<br />CPF: {booking.input.responsible.cpf}<br />Nascimento: {dateLabel(booking.input.responsible.birthDate)}<br />{booking.input.responsible.phone}<br />{booking.input.responsible.email}</p></div><div><h3 className="font-bold mb-2">Demais hóspedes</h3>{booking.input.guests.length ? booking.input.guests.map((g, i) => <p key={i} className="text-sm py-1">{g.name} · CPF: {g.cpf} · {dateLabel(g.birthDate)}</p>) : <p>Nenhum.</p>}</div><PriceSummary quote={booking.quote} />
            {booking.payment && <div className="rounded-xl border p-4"><h3 className="font-bold">Sinal recebido: {money(booking.payment.amount)}</h3><p>{dateLabel(booking.payment.date)} · {booking.payment.method}</p><p className="whitespace-pre-wrap break-words">{booking.payment.note}</p><p className="mt-2">Restante no check-in: {money(booking.quote.total - booking.payment.amount)}</p><p className="text-xs mt-2">Confirmada em {new Date(booking.confirmedAt!).toLocaleString('pt-BR')}</p></div>}
            <div className="flex flex-wrap gap-2">{booking.status === 'PENDENTE' && <button disabled={busy} className="reservation-button" onClick={() => void run(() => status('AGUARDANDO_SINAL'))}>Marcar como aguardando sinal</button>}{booking.status === 'AGUARDANDO_SINAL' && <button disabled={busy} className="reservation-button" onClick={() => { setConfirming(true); setPayment({ amount: booking.quote.deposit, date: today(), method: 'PIX', note: '' }); setReceived(false); }}>Confirmar reserva</button>}{booking.status === 'CONFIRMADA' && <button disabled={busy || booking.input.checkOut > today()} className="reservation-button" onClick={() => void run(() => status('FINALIZADA'))}>Finalizar reserva</button>}{['PENDENTE', 'AGUARDANDO_SINAL', 'CONFIRMADA'].includes(booking.status) && <button disabled={busy} className="reservation-secondary" onClick={() => { if (window.confirm('Cancelar esta solicitação/reserva? Uma reserva confirmada deixará de bloquear as datas.')) void run(() => status('CANCELADA')); }}>Cancelar reserva</button>}</div>
            {confirming && <form className="border-2 border-green-700 rounded-xl p-5 space-y-4" onSubmit={e => { e.preventDefault(); void run(() => status('CONFIRMADA')); }}><h3 className="font-bold text-lg">Confirmação do sinal</h3><p>Você confirma que recebeu o sinal referente a esta reserva? Ao confirmar, as datas serão bloqueadas.</p><Field label="Valor do sinal (R$)" type="number" min={booking.quote.total === 0 ? 0 : 0.01} max={booking.quote.total / 100} step="0.01" required value={payment.amount / 100} onChange={e => setPayment({ ...payment, amount: Math.round(Number(e.target.value) * 100) })} /><Field label="Data do pagamento" type="date" max={today()} required value={payment.date} onChange={e => setPayment({ ...payment, date: e.target.value })} /><Field label="Forma de pagamento" required maxLength={50} value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })} /><label className="block text-sm">Observação<textarea className="reservation-input mt-1" maxLength={1000} value={payment.note} onChange={e => setPayment({ ...payment, note: e.target.value })} /></label><label className="flex gap-3"><input type="checkbox" required checked={received} onChange={e => setReceived(e.target.checked)} />Confirmo que recebi o sinal.</label><p className="text-sm">Restante: {money(booking.quote.total - payment.amount)}, no check-in.</p><div className="flex flex-wrap gap-2"><button type="button" className="reservation-secondary" disabled={busy} onClick={() => setConfirming(false)}>Cancelar</button><button className="reservation-button" disabled={busy || !received}>{busy ? 'Verificando disponibilidade…' : 'Confirmar reserva'}</button></div></form>}
            <details><summary className="cursor-pointer font-bold">Histórico de alterações</summary><ol className="mt-3 space-y-3 text-sm">{booking.history.map((h, i) => <li key={i}>{new Date(h.at).toLocaleString('pt-BR')} · {statusLabels[h.status]}<br /><span className="text-gray-500">{h.actor}</span></li>)}</ol></details>
          </> : <p className="text-gray-500 py-12 text-center">Selecione uma solicitação para ver os detalhes.</p>}</section>
        </div>}
        {(tab === 'Tarifas e configurações' || tab === 'Cupons') && <ConfigurationForms data={data} tab={tab} busy={busy} save={value => run(async () => { await api('/api/admin', value); await refresh(); setNotice('Configuração salva.'); })} />}
      </>}
    </div>
  </main>;
}
