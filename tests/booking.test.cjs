const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const ts = require('typescript');
// Compile the actual TypeScript services without a separate test implementation.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
};
const { startPostgres } = require('./postgres.cjs');
let postgres;
before(async () => { postgres = await startPostgres(); process.env.DATABASE_URL = postgres.url; });
const store = require('../src/lib/booking/db.ts');
const service = require('../src/lib/booking/service.ts');
const calendar = require('../src/lib/booking/calendar.ts');
const validation = require('../src/lib/booking/validation.ts');
const { today } = require('../src/lib/booking/types.ts');
const originalFetch = global.fetch;
const feed = (events = '') => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}END:VCALENDAR`;
const event = (start, end) => `BEGIN:VEVENT\r\nUID:test-event\r\nDTSTART;VALUE=DATE:${start.replaceAll('-', '')}\r\nDTEND;VALUE=DATE:${end.replaceAll('-', '')}\r\nEND:VEVENT\r\n`;
const nextYear = Number(today().slice(0, 4)) + 1;
const start = `${nextYear}-10-10`, end = `${nextYear}-10-13`;
async function input(overrides = {}) {
  return { checkIn: start, checkOut: end, adults: 1, children: 0, pets: 0, responsible: { name: 'Pessoa de Teste', cpf: '52998224725', birthDate: '1990-01-01', phone: '32999943917', email: 'teste@example.com' }, guests: [], coupon: '', consent: true, idempotencyKey: randomUUID(), quoteToken: (await service.calculateQuote(start, end)).token, ...overrides };
}
beforeEach(async () => {
  await store.query('DELETE FROM bookings; DELETE FROM coupons; DELETE FROM rates;');
  await service.saveConfiguration({ kind: 'settings', value: { enabled: true, nightly: 36000, cleaning: 15000, depositPercent: 50, maxGuests: 8, whatsapp: '5532999943917', privacyUrl: '' } });
  global.fetch = async () => new Response(feed());
});
after(async () => { global.fetch = originalFetch; await store.closeDatabase(); await postgres?.stop(); });
test('pending and awaiting deposit never block; only manual confirmation blocks', async () => {
  const a = await service.createRequest(await input());
  const b = await service.createRequest(await input());
  assert.equal((await store.bookings()).length, 2);
  assert.deepEqual((await calendar.directDates()), []);
  await service.changeStatus(a.id, 'AGUARDANDO_SINAL');
  assert.deepEqual((await calendar.directDates()), []);
  await service.changeStatus(a.id, 'CONFIRMADA', { amount: 50000, date: today(), method: 'PIX', note: '' }, true);
  assert.equal((await calendar.directDates()).length, 3);
  assert(!(await calendar.directDates()).includes(end));
  await assert.rejects(service.createRequest(await input()), /bloqueio/);
  await service.changeStatus(b.id, 'AGUARDANDO_SINAL');
  await assert.rejects(service.changeStatus(b.id, 'CONFIRMADA', { amount: 10000, date: today(), method: 'PIX', note: '' }, true), /bloqueio/);
  await service.changeStatus(a.id, 'CANCELADA');
  assert.deepEqual((await calendar.directDates()), []);
});
test('simultaneous confirmations result in exactly one confirmed booking', async () => {
  const a = await service.createRequest(await input()); const b = await service.createRequest(await input());
  await service.changeStatus(a.id, 'AGUARDANDO_SINAL'); await service.changeStatus(b.id, 'AGUARDANDO_SINAL');
  const results = await Promise.allSettled([a, b].map(item => service.changeStatus(item.id, 'CONFIRMADA', { amount: 10000, date: today(), method: 'PIX', note: '' }, true)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await store.bookings()).filter(b => b.status === 'CONFIRMADA').length, 1);
});
test('PostgreSQL exclusion constraint rejects conflicts even outside service', async () => {
  const a = await service.createRequest(await input()); const b = await service.createRequest(await input());
  await store.query("UPDATE bookings SET status='CONFIRMADA' WHERE id=$1", [a.id]);
  await assert.rejects(store.query("UPDATE bookings SET status='CONFIRMADA' WHERE id=$1", [b.id]), { code: "23P01" });
});
test('Airbnb rechecked before confirmation, failure is closed, date boundaries stay exclusive', async () => {
  const a = await service.createRequest(await input()); await service.changeStatus(a.id, 'AGUARDANDO_SINAL');
  global.fetch = async () => new Response(feed(event(start, end)));
  assert.deepEqual(await calendar.airbnbDates(), [start, `${nextYear}-10-11`, `${nextYear}-10-12`]);
  await assert.rejects(service.changeStatus(a.id, 'CONFIRMADA', { amount: 10000, date: today(), method: 'PIX', note: '' }, true), /bloqueio/);
  await calendar.assertAvailable(end, `${nextYear}-10-14`, await calendar.airbnbDates());
  global.fetch = async () => new Response('unavailable', { status: 503 });
  await assert.rejects(service.createRequest(await input()), /Airbnb/);
  await assert.rejects(service.changeStatus(a.id, 'CONFIRMADA', { amount: 10000, date: today(), method: 'PIX', note: '' }, true), /Airbnb/);
  global.fetch = async () => new Response('<html>Error</html>');
  await assert.rejects(calendar.airbnbDates(), /Airbnb/);
});
test('seasonal nightly rates, cent rounding, coupons and price snapshots', async () => {
  await service.saveConfiguration({ kind: 'rate', value: { id: '', name: 'Especial', start, end: `${nextYear}-10-11`, nightly: 50000 } });
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'CANGUMBIM10', type: 'percent', value: 10, start: today(), end, limit: 1, active: true } });
  const q = await service.calculateQuote(start, end, 'cangumbim10');
  assert.equal(q.lodging, 122000); assert.equal(q.discount, 13700); assert.equal(q.total, 123300);
  const payload = await input({ coupon: 'cangumbim10', quoteToken: q.token });
  const result = await service.createRequest(payload);
  assert.equal((await store.coupons())[0].uses, 1);
  await assert.rejects(() => service.calculateQuote(start, end, 'CANGUMBIM10'), /limite/);
  assert.deepEqual(await service.createRequest(payload), result);
  assert.equal((await store.coupons())[0].uses, 1);
  await service.saveConfiguration({ kind: 'settings', value: { ...(await store.settings()), nightly: 100000 } });
  assert.equal((await store.bookings())[0].quote.total, 123300);
  const message = decodeURIComponent(result.whatsappUrl);
  assert(message.includes('CPF: 52998224725') && message.includes(result.id) && message.includes('CANGUMBIM10'));
});
test('uses the special price for one or two adults with zero or one child', async () => {
  await service.saveConfiguration({ kind: 'settings', value: { ...(await store.settings()), nightlyTwoGuests: 25000, cleaningTwoGuests: 8000 } });
  const oneAdult = await service.calculateQuote(start, end, '', 1, 0);
  const oneAdultWithChild = await service.calculateQuote(start, end, '', 1, 1);
  const adultsOnly = await service.calculateQuote(start, end, '', 2, 0);
  const withChild = await service.calculateQuote(start, end, '', 2, 1);
  const threeAdults = await service.calculateQuote(start, end, '', 3, 0);
  const twoChildren = await service.calculateQuote(start, end, '', 1, 2);
  assert.equal(oneAdult.lodging, 75000);
  assert.equal(oneAdultWithChild.total, 83000);
  assert.equal(adultsOnly.lodging, 75000);
  assert.equal(adultsOnly.cleaning, 8000);
  assert.equal(withChild.total, 83000);
  assert.equal(threeAdults.total, 123000);
  assert.equal(twoChildren.total, 123000);
});
test('coupon validation: inactive, expired, future, fixed clamp and atomic limit', async () => {
  const coupon = { code: 'TESTE', type: 'fixed', value: 999999, start: today(), end, limit: 1, active: true };
  await service.saveConfiguration({ kind: 'coupon', value: { ...coupon, active: false } });
  await assert.rejects(() => service.calculateQuote(start, end, 'TESTE'), /desativado/);
  await service.saveConfiguration({ kind: 'coupon', value: { ...coupon, start: '2020-01-01', end: '2020-12-31' } });
  await assert.rejects(() => service.calculateQuote(start, end, 'TESTE'), /validade/);
  await service.saveConfiguration({ kind: 'coupon', value: { ...coupon, start } });
  await assert.rejects(() => service.calculateQuote(start, end, 'TESTE'), /validade/);
  await service.saveConfiguration({ kind: 'coupon', value: coupon });
  const q = await service.calculateQuote(start, end, 'TESTE'); assert.equal(q.total, 0);
  const result = await Promise.allSettled([1, 2].map(async () => service.createRequest(await input({ coupon: 'TESTE', quoteToken: q.token }))));
  assert.equal(result.filter(r => r.status === 'fulfilled').length, 1);
});
test('accumulative coupons combine only with other accumulative coupons', async () => {
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'ACUM10', type: 'percent', value: 10, start: today(), end, limit: 0, active: true, accumulative: true } });
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'ACUM20', type: 'percent', value: 20, start: today(), end, limit: 0, active: true, accumulative: true } });
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'SOZINHO', type: 'percent', value: 5, start: today(), end, limit: 0, active: true, accumulative: false } });
  const accumulated = await service.calculateQuote(start, end, 'ACUM10,ACUM20');
  assert.equal(accumulated.discount, 34440);
  await assert.rejects(() => service.calculateQuote(start, end, 'ACUM10,SOZINHO'), /sozinho/);
});
test('backend rejects invalid personal data, overcapacity, stale quotes and invalid transitions', async () => {
  const base = await input();
  for (const change of [{ consent: false }, { adults: 9 }, { checkOut: start }, { checkIn: '2026-02-30' }, { responsible: { ...base.responsible, cpf: '11111111111' } }, { responsible: { ...base.responsible, birthDate: today() } }, { guests: [base.responsible] }]) {
    await assert.rejects(service.createRequest({ ...base, ...change }));
  }
  await assert.rejects(service.createRequest({ ...base, quoteToken: 'tampered' }), /valores mudaram/);
  assert.equal((await store.bookings()).length, 0);
  const a = await service.createRequest(base);
  await assert.rejects(service.changeStatus(a.id, 'CONFIRMADA'), /não é permitida/);
  await service.changeStatus(a.id, 'AGUARDANDO_SINAL');
  await assert.rejects(service.changeStatus(a.id, 'CONFIRMADA', { amount: 100, date: today(), method: 'PIX', note: '' }, false), /recebimento/);
  assert.equal((await store.bookings())[0].status, 'AGUARDANDO_SINAL');
  assert(!decodeURIComponent(a.whatsappUrl).includes('Cupom:'));
  await assert.rejects(service.createRequest({ ...base, responsible: { ...base.responsible, name: 'Outra Pessoa' } }), /outros dados/);
});
test('configuration rejects overlapping tariffs and invalid values', async () => {
  const r = { id: '', name: 'Feriado', start, end, nightly: 40000 };
  await service.saveConfiguration({ kind: 'rate', value: r });
  await assert.rejects(async () => service.saveConfiguration({ kind: 'rate', value: r }), /sobrepõe/);
  await assert.rejects(async () => service.saveConfiguration({ kind: 'settings', value: { ...(await store.settings()), nightly: -1 } }));
  await assert.rejects(async () => service.saveConfiguration({ kind: 'settings', value: { ...(await store.settings()), privacyUrl: 'javascript:alert(1)' } }));
  assert.equal(validation.ageAt('2010-10-11', '2028-10-10'), 17);
  assert.equal(validation.ageAt('2010-10-11', '2028-10-11'), 18);
});

test('coupon uses can be reset and coupons can be deleted', async () => {
  const coupon = { code: 'LIMPAR', type: 'percent', value: 10, start: today(), end, limit: 1, active: true };
  await service.saveConfiguration({ kind: 'coupon', value: coupon });
  const quote = await service.calculateQuote(start, end, coupon.code);
  await service.createRequest(await input({ coupon: coupon.code, quoteToken: quote.token }));
  assert.equal((await store.coupons())[0].uses, 1);
  await service.saveConfiguration({ kind: 'resetCouponUses', code: coupon.code });
  assert.equal((await store.coupons())[0].uses, 0);
  await service.saveConfiguration({ kind: 'deleteCoupon', code: coupon.code });
  assert.deepEqual(await store.coupons(), []);
});

test('migrations are repeatable and never reset configured prices', async () => {
  const { migrate } = await import('../scripts/migrate.mjs');
  const a = await service.createRequest(await input());
  await migrate(store.db());
  await migrate(store.db());
  assert.equal((await store.query('SELECT * FROM schema_migrations')).rows.length, 1);
  assert.equal((await store.settings()).nightly, 36000);
  assert.equal((await store.bookings())[0].id, a.id);
});

test('PostgreSQL rolls back booking and coupon changes together', async () => {
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'ROLLBACK', type: 'percent', value: 10, start: today(), end, limit: 0, active: true } });
  const q = await service.calculateQuote(start, end, 'ROLLBACK');
  const payload = await input({ coupon: 'ROLLBACK', quoteToken: q.token });
  await store.query("ALTER TABLE coupons ADD CONSTRAINT simulate_write_failure CHECK ((data->>'uses')::integer = 0)");
  try { await assert.rejects(service.createRequest(payload), { code: '23514' }); }
  finally { await store.query('ALTER TABLE coupons DROP CONSTRAINT simulate_write_failure'); }
  assert.equal((await store.bookings()).length, 0);
  assert.equal((await store.coupons())[0].uses, 0);
});

test('concurrent retries create one booking and consume one coupon use', async () => {
  await service.saveConfiguration({ kind: 'coupon', value: { code: 'RETRY', type: 'fixed', value: 5000, start: today(), end, limit: 1, active: true } });
  const q = await service.calculateQuote(start, end, 'RETRY');
  const payload = await input({ coupon: 'RETRY', quoteToken: q.token });
  const results = await Promise.all([service.createRequest(payload), service.createRequest(payload)]);
  assert.equal(results[0].id, results[1].id);
  assert.equal((await store.bookings()).length, 1);
  assert.equal((await store.coupons())[0].uses, 1);
});

test('rate limiting is atomic across PostgreSQL connections', async () => {
  const { throttle } = require('../src/lib/booking/auth.ts');
  const results = await Promise.allSettled(Array.from({ length: 12 }, () => throttle('concurrent-test', 3, 900)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 3);
  assert(results.filter(r => r.status === 'rejected').every(r => r.reason.status === 429));
});

test('legacy SQLite import preserves records and rejects a nonempty destination', async () => {
  const { DatabaseSync } = require('node:sqlite');
  const { importSqlite } = await import('../scripts/import-sqlite.mjs');
  const path = require('node:path'), os = require('node:os');
  const location = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cangumbim-import-')), 'legacy.sqlite');
  await service.createRequest(await input());
  const records = await store.bookings();
  const config = await store.settings();
  const source = new DatabaseSync(location);
  source.exec('CREATE TABLE settings(id INTEGER, data TEXT); CREATE TABLE rates(id TEXT, data TEXT); CREATE TABLE coupons(code TEXT, data TEXT); CREATE TABLE bookings(id TEXT, request_key TEXT, status TEXT, check_in TEXT, check_out TEXT, data TEXT)');
  source.prepare('INSERT INTO settings VALUES (1, ?)').run(JSON.stringify(config));
  for (const b of records) source.prepare('INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?)').run(b.id, b.input.idempotencyKey, b.status, b.input.checkIn, b.input.checkOut, JSON.stringify(b));
  source.close();
  await assert.rejects(importSqlite(store.db(), location), /vazio/);
  await store.query('DELETE FROM bookings');
  await service.saveConfiguration({ kind: 'settings', value: { enabled: false, nightly: 0, cleaning: 0, depositPercent: 50, maxGuests: 8, whatsapp: '5532999943917', privacyUrl: '' } });
  assert.deepEqual(await importSqlite(store.db(), location), { bookings: 1, coupons: 0, rates: 0 });
  assert.deepEqual(await store.bookings(), records);
  assert.deepEqual(await store.settings(), config);
  await assert.rejects(importSqlite(store.db(), location), /vazio/);
});
