import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './db';
import { BookingError } from './validation';
const cookieName = 'cangumbim_admin';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export async function throttle(key: string, max: number, seconds: number) {
  const now = Date.now();
  const { rows } = await query<{ count: number }>(`INSERT INTO attempts (key, count, expires) VALUES ($1, 1, $2)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN attempts.expires <= $3 THEN 1 ELSE LEAST(attempts.count + 1, $4 + 1) END,
      expires = CASE WHEN attempts.expires <= $3 THEN EXCLUDED.expires ELSE attempts.expires END
    RETURNING count`, [key, now + seconds * 1000, now, max]);
  if (rows[0].count > max) throw new BookingError('Muitas tentativas. Aguarde alguns minutos.', 429);
}
export async function isAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  return !!token && (await query('SELECT token FROM sessions WHERE token=$1 AND expires>$2', [digest(token), Date.now()])).rows.length > 0;
}
export async function requireAdmin() { if (!await isAdmin()) throw new BookingError('Entre no painel para continuar.', 401); }
export async function login(password: unknown) {
  await throttle('admin-login', 10, 900);
  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured) throw new BookingError('Configure ADMIN_PASSWORD_HASH no servidor para habilitar o painel.', 503);
  const [salt, hash] = configured.split(':');
  if (!salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) throw new BookingError('A configuração de acesso precisa ser corrigida no servidor.', 503);
  if (typeof password !== 'string' || password.length > 256 || !timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'))) throw new BookingError('Senha incorreta.', 401);
  const token = randomBytes(32).toString('hex');
  await query('DELETE FROM sessions WHERE expires < $1', [Date.now()]);
  await query('INSERT INTO sessions (token, expires) VALUES ($1, $2)', [digest(token), Date.now() + 8 * 3600000]);
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
}
export async function logout() {
  const jar = await cookies(); const token = jar.get(cookieName)?.value;
  if (token) await query('DELETE FROM sessions WHERE token=$1', [digest(token)]);
  jar.delete(cookieName);
}
