import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { BookingError } from './validation';
import type { Booking, Coupon, Rate, Settings } from './types';

let pool: Pool | undefined;
const transactionClient = new AsyncLocalStorage<PoolClient>();

export function db() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new BookingError('Configure DATABASE_URL no servidor para habilitar as reservas.', 503);
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 15000,
      allowExitOnIdle: true,
      application_name: 'sitio-cangumbim',
    });
    // Never log connection strings, SQL parameters or guest records.
    pool.on('error', () => console.error('Conexão ociosa com PostgreSQL encerrada.'));
  }
  return pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {
  return (transactionClient.getStore() ?? db()).query<T>(sql, values);
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  if (transactionClient.getStore()) return fn();
  const client = await db().connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '20s'");
    // One property: serialize booking/configuration writes across Vercel instances.
    // Transaction-scoped locks work with Neon's PgBouncer transaction pooling.
    await client.query('SELECT pg_advisory_xact_lock(17526417)');
    const result = await transactionClient.run(client, fn);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { discard = true; }
    const code = (error as { code?: string }).code;
    if (code === '23P01') throw new BookingError('As datas possuem uma reserva confirmada. Escolha outro período.', 409);
    if (['55P03', '40P01', '40001'].includes(code ?? '')) throw new BookingError('Outra operação está em andamento. Atualize e tente novamente.', 409);
    throw error;
  } finally { client.release(discard); }
}

export async function settings(): Promise<Settings> {
  const result = await query<{ data: Settings }>('SELECT data FROM settings WHERE id=1');
  if (!result.rows[0]) throw new BookingError('Execute a migração do banco antes de abrir as reservas.', 503);
  return result.rows[0].data;
}
export async function rates(): Promise<Rate[]> {
  return (await query<{ data: Rate }>('SELECT data FROM rates ORDER BY id')).rows.map(row => row.data);
}
export async function coupons(): Promise<Coupon[]> {
  return (await query<{ data: Coupon }>('SELECT data FROM coupons ORDER BY code')).rows.map(row => row.data);
}
export async function bookings(): Promise<Booking[]> {
  return (await query<{ data: Booking }>('SELECT data FROM bookings ORDER BY created_at DESC, id DESC')).rows.map(row => row.data);
}
export async function saveBooking(booking: Booking) {
  await query('UPDATE bookings SET status=$1, data=$2, updated_at=$3 WHERE id=$4', [booking.status, booking, booking.updatedAt, booking.id]);
}
export async function closeDatabase() {
  const current = pool;
  pool = undefined;
  if (current) await current.end();
}
