'use client';
import { useState } from 'react';
import { dateLabel, today, type CalendarData } from '@/lib/booking/types';
export function Calendar({ data, start = '', end = '', onSelect, pending = [] }: { data: CalendarData; start?: string; end?: string; onSelect?: (day: string) => void; pending?: string[] }) {
  const [month, setMonth] = useState(() => today().slice(0, 7) + '-01');
  const date = new Date(month + 'T12:00:00');
  const length = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  function change(amount: number) { const next = new Date(date); next.setMonth(next.getMonth() + amount); setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`); }
  return <div className="rounded-2xl bg-white p-4 sm:p-6 text-gray-800 shadow-lg">
    <div className="flex items-center justify-between gap-2 mb-5"><button type="button" className="reservation-secondary" aria-label="Mês anterior" onClick={() => change(-1)}>‹</button><h3 className="font-serif text-lg capitalize">{date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3><button type="button" className="reservation-secondary" aria-label="Próximo mês" onClick={() => change(1)}>›</button></div>
    <div className="grid grid-cols-7 text-center gap-1"><>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <span key={i} className="text-xs text-gray-500 py-2">{day}</span>)}</>
      {Array.from({ length: date.getDay() }, (_, i) => <span key={`blank${i}`} />)}
      {Array.from({ length }, (_, i) => {
        const day = `${month.slice(0, 7)}-${String(i + 1).padStart(2, '0')}`;
        const blocked = data.unavailableDates.includes(day);
        const checkout = !!start && !end && day > start && !data.unavailableDates.some(d => d >= start && d < day);
        const state = data.airbnbDates.includes(day) ? 'Airbnb' : data.confirmedDates.includes(day) ? 'Confirmada' : pending.includes(day) ? 'Pendente, disponível' : 'Disponível';
        const selected = day === start || day === end || (start && end && day > start && day < end);
        return <button key={day} type="button" disabled={!!onSelect && (day < today() || (blocked && !checkout))} onClick={() => onSelect?.(day)} aria-label={`${dateLabel(day)}: ${state}${checkout ? ', permitido para saída' : ''}`} aria-pressed={!!selected} title={`${dateLabel(day)}: ${state}`} className={`min-h-10 rounded-lg text-sm disabled:opacity-40 ${selected ? 'bg-green-800 text-white ring-2 ring-green-500' : state === 'Airbnb' ? 'bg-red-100 text-red-800' : state === 'Confirmada' ? 'bg-blue-100 text-blue-800' : pending.includes(day) ? 'bg-yellow-100 text-yellow-900' : 'bg-green-50 text-green-900'} ${onSelect ? 'hover:ring-2 hover:ring-green-500' : 'cursor-default'}`}>{i + 1}</button>;
      })}
    </div>
    <div className="flex flex-wrap gap-3 mt-5 text-xs"><span className="text-green-800">● Disponível</span><span className="text-blue-700">● Confirmada</span><span className="text-red-700">● Airbnb</span>{pending.length > 0 && <span className="text-yellow-700">● Pendente (não bloqueia)</span>}</div>
    <p className="mt-3 text-xs text-gray-500">Atualizado em {new Date(data.lastUpdated).toLocaleString('pt-BR')}. O dia da saída não conta como diária.</p>
  </div>;
}
