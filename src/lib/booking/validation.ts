import { today, type Guest, type RequestInput } from './types';
export class BookingError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function requireValue(condition: unknown, message: string): asserts condition { if (!condition) throw new BookingError(message); }
export function validDate(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value; }
export function nightsBetween(start: string, end: string) {
  requireValue(validDate(start) && validDate(end) && start < end, 'Informe um período válido de entrada e saída.');
  const length = (Date.parse(end) - Date.parse(start)) / 86400000;
  requireValue(length <= 366, 'O período máximo é de 366 diárias.');
  return Array.from({ length }, (_, i) => new Date(Date.parse(start) + i * 86400000).toISOString().slice(0, 10));
}
export function integer(value: unknown, min: number, max: number) { return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max; }
export function textValue(value: unknown, min = 1, max = 150): value is string { return typeof value === 'string' && value.trim().length >= min && value.length <= max; }
export function validCpf(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;
  return [9, 10].every(length => { let sum = 0; for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i); const check = (sum * 10) % 11; return Number(digits[length]) === (check === 10 ? 0 : check); });
}
export function ageAt(birth: string, date: string) { return Number(date.slice(0, 4)) - Number(birth.slice(0, 4)) - (date.slice(5) < birth.slice(5) ? 1 : 0); }
function guest(value: Guest) {
  requireValue(value && textValue(value.name, 3) && value.name.trim().includes(' '), 'Informe o nome completo de cada hóspede.');
  requireValue(textValue(value.cpf, 11, 14) && validCpf(value.cpf), 'Informe um CPF válido para cada hóspede.');
  requireValue(validDate(value.birthDate) && value.birthDate <= today() && ageAt(value.birthDate, today()) <= 120, 'Informe uma data de nascimento válida.');
  return { name: value.name.trim(), cpf: value.cpf.replace(/\D/g, ''), birthDate: value.birthDate };
}
export function validateInput(input: RequestInput, maxGuests: number): RequestInput {
  requireValue(input && typeof input === 'object', 'Dados inválidos.');
  nightsBetween(input.checkIn, input.checkOut);
  requireValue(input.checkIn >= today(), 'O check-in não pode estar no passado.');
  requireValue(integer(input.adults, 1, maxGuests) && integer(input.children, 0, maxGuests) && input.adults + input.children <= maxGuests, `A capacidade é de ${maxGuests} hóspedes.`);
  requireValue(integer(input.pets, 0, 10), 'Quantidade de pets inválida.');
  const responsible = guest(input.responsible);
  requireValue(ageAt(responsible.birthDate, today()) >= 18, 'O responsável deve ter pelo menos 18 anos.');
  requireValue(textValue(input.responsible.phone, 10, 20) && /^\+?[\d\s()-]+$/.test(input.responsible.phone) && /^\d{10,15}$/.test(input.responsible.phone.replace(/\D/g, '')), 'Informe um telefone válido.');
  requireValue(textValue(input.responsible.email, 5, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.responsible.email), 'Informe um e-mail válido.');
  requireValue(Array.isArray(input.guests) && input.guests.length === input.adults + input.children - 1, 'Cadastre todos os demais hóspedes.');
  const guests = input.guests.map(guest);
  requireValue(new Set([responsible, ...guests].map(g => g.cpf)).size === guests.length + 1, 'Há CPFs repetidos na solicitação.');
  requireValue([responsible, ...guests].filter(g => ageAt(g.birthDate, input.checkIn) < 18).length === input.children, 'Confira adultos e crianças: menores de 18 anos no check-in contam como crianças.');
  requireValue(input.consent === true, 'É necessário autorizar o uso dos dados para a reserva.');
  requireValue(typeof input.idempotencyKey === 'string' && /^[a-f0-9-]{36}$/.test(input.idempotencyKey), 'Identificador da solicitação inválido.');
  requireValue(typeof input.coupon === 'string' && input.coupon.length <= 40 && typeof input.quoteToken === 'string', 'Cotação inválida.');
  return { checkIn: input.checkIn, checkOut: input.checkOut, adults: input.adults, children: input.children, pets: input.pets, responsible: { ...responsible, phone: input.responsible.phone.trim(), email: input.responsible.email.trim() }, guests, consent: true, coupon: input.coupon.trim().toUpperCase(), idempotencyKey: input.idempotencyKey, quoteToken: input.quoteToken };
}
