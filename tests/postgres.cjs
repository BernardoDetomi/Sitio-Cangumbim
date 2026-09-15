const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { randomBytes } = require('node:crypto');
const { createServer } = require('node:net');
const { once } = require('node:events');
const { Pool } = require('pg');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

// Always creates a new cluster. Never reads DATABASE_URL or touches a real database.
async function startPostgres() {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const { migrate } = await import('../scripts/migrate.mjs');
  const listener = createServer();
  listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const password = randomBytes(24).toString('hex');
  const directory = mkdtempSync(join(tmpdir(), 'cangumbim-postgres-'));
  const database = new EmbeddedPostgres({
    databaseDir: join(directory, 'cluster'), user: 'postgres', password, port,
    persistent: true, createPostgresUser: false,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    postgresFlags: ['-h', '127.0.0.1'],
    onLog: () => {}, onError: () => {},
  });
  // Use pg_ctl for graceful shutdown: taskkill can orphan PostgreSQL 18 workers.
  const platform = process.platform === 'win32' ? 'windows' : process.platform;
  const { pg_ctl } = await import(`@embedded-postgres/${platform}-${process.arch}`);
  let started = false;
  let stopping;
  database.stop = () => {
    if (!started) return Promise.resolve();
    return stopping ??= promisify(execFile)(pg_ctl, ['-D', join(directory, 'cluster'), '-m', 'fast', '-w', '-t', '15', 'stop'], { windowsHide: true }).then(() => {});
  };
  await database.initialise();
  await database.start();
  started = true;
  const url = `postgresql://postgres:${password}@127.0.0.1:${port}/postgres`;
  const pool = new Pool({ connectionString: url });
  try { await migrate(pool); }
  catch (error) { await database.stop(); throw error; }
  finally { await pool.end(); }
  return { url, stop: () => database.stop() };
}
module.exports = { startPostgres };
