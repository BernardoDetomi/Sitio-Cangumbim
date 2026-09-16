import type { InputHTMLAttributes } from 'react';
import { dateLabel, money, type Guest, type Quote } from '@/lib/booking/types';
export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-medium space-y-1"><span>{label}</span><input className="reservation-input" {...props} /></label>;
}
export function GuestFields({ value, onChange }: { value: Guest; onChange: (value: Guest) => void }) {
  return <div className="grid sm:grid-cols-2 gap-4"><Field label="Nome completo" autoComplete="name" placeholder="Ex.: Maria da Silva" required minLength={3} maxLength={150} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} /><Field label="CPF" inputMode="numeric" placeholder="000.000.000-00" required maxLength={14} value={value.cpf} onChange={e => onChange({ ...value, cpf: e.target.value })} /><Field label="Data de nascimento" type="date" required value={value.birthDate} onChange={e => onChange({ ...value, birthDate: e.target.value })} /></div>;
}
export function PriceSummary({ quote }: { quote: Quote }) {
  return <div className="rounded-xl bg-green-50 p-5 text-green-950 space-y-3">
    <details><summary className="cursor-pointer">{quote.nights.length} diárias — {money(quote.lodging)}</summary><ul className="mt-2 text-sm space-y-1">{quote.nights.map(n => <li key={n.date} className="flex justify-between gap-2"><span>{dateLabel(n.date)}</span><span>{money(n.amount)}</span></li>)}</ul></details>
    <div className="flex justify-between gap-2"><span>Taxa de limpeza</span><span>{money(quote.cleaning)}</span></div>
    <div className="flex justify-between gap-2"><span>Subtotal</span><span>{money(quote.lodging + quote.cleaning)}</span></div>
    {quote.coupon && <div className="flex justify-between gap-2"><span>Cupons {quote.coupon.split(',').join(', ')}</span><span>−{money(quote.discount)}</span></div>}
    <div className="flex justify-between gap-2 border-t border-green-200 pt-3 text-xl font-bold"><span>Total</span><span>{money(quote.total)}</span></div>
    <p className="text-sm">Sinal previsto: {money(quote.deposit)}<br />Restante no check-in: {money(quote.total - quote.deposit)}</p>
  </div>;
}
