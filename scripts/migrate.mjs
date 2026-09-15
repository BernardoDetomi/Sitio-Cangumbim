import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import pg from 'pg';
import nextEnv from '@next/env';

export async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(17526418)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = new URL('../migrations/', import.meta.url);
    const files = (await readdir(directory)).filter(name => /^\d+_.+\.sql$/.test(name)).sort();
    for (const version of files) {
      const sql = await readFile(new URL(version, directory), 'utf8');
      const checksum = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
      const previous = await client.query('SELECT checksum FROM schema_migrations WHERE version=$1', [version]);
      if (previous.rows.length) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`A migração ${version} já aplicada foi alterada. Crie uma nova migração.`);
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)', [version, checksum]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  nextEnv.loadEnvConfig(process.cwd());
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Configure DATABASE_URL_UNPOOLED ou DATABASE_URL em .env.local.');
    process.exitCode = 1;
  } else {
    const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 15000 });
    try { await migrate(pool); console.log('Migrações PostgreSQL aplicadas.'); }
    catch (error) { console.error('Falha na migração. Verifique conexão, permissões e versão do schema. Código:', error.code || 'MIGRATION_ERROR'); process.exitCode = 1; }
    finally { await pool.end(); }
  }
}
