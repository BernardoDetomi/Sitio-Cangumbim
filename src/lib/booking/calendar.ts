import ical from 'node-ical';
import { query } from './db';
import { BookingError, nightsBetween } from './validation';

// Preserve the feed already used by the site; deployments can override it.
const originalFeed = 'https://www.airbnb.com.br/calendar/ical/1400169773928514039.ics?t=093461f8b90b4b17886153abaab62216';
export async function airbnbDates(): Promise<string[]> {
  try {
    const response = await fetch(process.env.AIRBNB_ICAL_URL || originalFeed, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Feed unavailable');
    const source = await response.text();
    if (!source.includes('BEGIN:VCALENDAR') || !source.includes('END:VCALENDAR')) throw new Error('Invalid calendar');
    const events = ical.sync.parseICS(source);
    const dates = new Set<string>();
    for (const event of Object.values(events)) {
      if (!event || event.type !== 'VEVENT' || event.status === 'CANCELLED') continue;
      // Airbnb exports date-only intervals with an exclusive DTEND.
      // Reject unsupported recurrence rather than silently missing blocked dates.
      if (event.rrule || !event.start || !event.end) throw new Error('Unsupported event');
      const key = (date: Date) => event.datetype === 'date'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
      const start = key(event.start);
      const end = key(event.end);
      if (start >= end) throw new Error('Invalid interval');
      for (let time = Date.parse(start); time < Date.parse(end); time += 86400000) {
        if (dates.size > 20000) throw new Error('Calendar too large');
        dates.add(new Date(time).toISOString().slice(0, 10));
      }
    }
    return [...dates];
  } catch { throw new BookingError('Não foi possível consultar o Airbnb. Tente novamente antes de solicitar ou confirmar uma reserva.', 503); }
}
export async function directDates() {
  const { rows } = await query<{ start: string; end: string }>("SELECT check_in::text AS start, check_out::text AS end FROM bookings WHERE status='CONFIRMADA'");
  return [...new Set(rows.flatMap(row => nightsBetween(row.start, row.end)))];
}
export async function calendar() {
  const external = await airbnbDates();
  const direct = await directDates();
  return { unavailableDates: [...new Set([...external, ...direct])], airbnbDates: external, confirmedDates: direct, lastUpdated: new Date().toISOString() };
}
export async function assertAvailable(start: string, end: string, external: string[], excludeId?: string) {
  const nights = nightsBetween(start, end);
  const conflict = nights.some(day => external.includes(day)) || (await query("SELECT id FROM bookings WHERE status='CONFIRMADA' AND check_in < $1::date AND check_out > $2::date AND ($3::text IS NULL OR id <> $3) LIMIT 1", [end, start, excludeId ?? null])).rows.length > 0;
  if (conflict) throw new BookingError('As datas possuem um bloqueio do Airbnb ou uma reserva confirmada. Escolha outro período.', 409);
}
