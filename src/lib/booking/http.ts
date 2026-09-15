import { NextResponse } from 'next/server';
import { BookingError } from './validation';
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }); }
export function errorResponse(error: unknown) { return json({ error: error instanceof BookingError ? error.message : 'Não foi possível concluir a operação. Tente novamente.' }, error instanceof BookingError ? error.status : 500); }
export function sameOrigin(request: Request) {
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  if (request.headers.get('origin') !== expected) throw new BookingError('Origem da requisição não autorizada.', 403);
}
export async function body(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new BookingError('Envie dados em JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new BookingError('Dados ausentes.');
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 32768) { await reader.cancel(); throw new BookingError('Solicitação muito grande.', 413); } chunks.push(value); }
  try { const result = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(); return result; }
  catch { throw new BookingError('JSON inválido.'); }
}
