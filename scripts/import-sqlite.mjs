import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import pg from 'pg';
import nextEnv from '@next/env';

// One-time, explicit import. The application never loads SQLite.
export async function importSqlite(pool, sourcePath) {
  const { DatabaseSync } = await import('node:sqlite');
  const source = new DatabaseSync(resolve(sourcePath), { readOnly: true });
  let snapshot;
  try {
    source.exec('BEGIN');
    snapshot = {
      settings: source.prepare('SELECT data FROM settings WHERE id=1').get(),
      rates: source.prepare('SELECT id, data FROM rates').all(),
      coupons: source.prepare('SELECT code, data FROM coupons').all(),
      bookings: source.prepare('SELECT * FROM bookings').all(),
    };
    source.exec('COMMIT');
  } finally { source.close(); }
  if (!snapshot.settings) throw new Error('O SQLite de origem não contém configurações.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(17526417)');
    await client.query('LOCK TABLE settings, rates, coupons, bookings IN ACCESS EXCLUSIVE MODE');
    const occupied = await client.query('SELECT (SELECT count(*) FROM bookings) + (SELECT count(*) FROM rates) + (SELECT count(*) FROM coupons) AS total');
    const target = (await client.query('SELECT data FROM settings WHERE id=1')).rows[0]?.data;
    const initial = { enabled: false, nightly: 0, cleaning: 0, depositPercent: 50, maxGuests: 8, whatsapp: '5532999943917', privacyUrl: '' };
    if (Number(occupied.rows[0].total) !== 0 || !isDeepStrictEqual(target, initial)) throw new Error('Use um banco recém-migrado e vazio como destino. Nenhum dado foi substituído.');
    for (const row of snapshot.rates) await client.query('INSERT INTO rates (id, data) VALUES ($1, $2)', [row.id, JSON.parse(row.data)]);
    for (const row of snapshot.coupons) await client.query('INSERT INTO coupons (code, data) VALUES ($1, $2)', [row.code, JSON.parse(row.data)]);
    for (const row of snapshot.bookings) {
      const booking = JSON.parse(row.data);
      if (booking.id !== row.id || booking.status !== row.status || booking.input.checkIn !== row.check_in || booking.input.checkOut !== row.check_out) throw new Error('Reserva inconsistente no banco de origem. Corrija antes de importar.');
      await client.query('INSERT INTO bookings (id, request_key, status, check_in, check_out, data, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [row.id, row.request_key, row.status, row.check_in, row.check_out, booking, booking.createdAt, booking.updatedAt]);
    }
    await client.query('UPDATE settings SET data=$1 WHERE id=1', [JSON.parse(snapshot.settings.data)]);
    await client.query('COMMIT');
    return { bookings: snapshot.bookings.length, coupons: snapshot.coupons.length, rates: snapshot.rates.length };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  nextEnv.loadEnvConfig(process.cwd());
  const sourcePath = process.argv[2];
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!sourcePath || !connectionString) {
    console.error('Configure a conexão Neon e execute: npm run db:import-sqlite -- caminho/do/banco.sqlite');
    process.exitCode = 1;
  } else {
    const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 15000 });
    try { console.log('Importação concluída:', await importSqlite(pool, sourcePath)); }
    catch (error) { console.error('Importação cancelada sem alterar o destino. Confira origem, destino vazio e conflitos entre reservas. Código:', error.code || 'IMPORT_ERROR'); process.exitCode = 1; }
    finally { await pool.end(); }
  }
}
