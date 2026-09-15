const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { startPostgres } = require('./postgres.cjs');
const { randomBytes, randomUUID, scryptSync } = require('node:crypto');

test('production HTTP flow: auth, CSRF, private data, public requests, deposit and conflicts', { timeout: 90000 }, async () => {
  const postgres = await startPostgres();
  const feed = createServer((req, res) => { res.setHeader('Content-Type', 'text/calendar'); res.end('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n'); });
  feed.listen(0, '127.0.0.1'); await once(feed, 'listening');
  const reservePort = createServer(); reservePort.listen(0, '127.0.0.1'); await once(reservePort, 'listening');
  const port = reservePort.address().port; await new Promise(resolve => reservePort.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const password = randomBytes(24).toString('hex'); const salt = randomBytes(16).toString('hex');
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { windowsHide: true, stdio: 'pipe', env: { ...process.env, APP_ORIGIN: origin, DATABASE_URL: postgres.url, ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString('hex')}`, AIRBNB_ICAL_URL: `http://127.0.0.1:${feed.address().port}` } });
  let output = ''; server.stdout.on('data', d => { output += d; }); server.stderr.on('data', d => { output += d; });
  let cookie = '';
  async function request(path, payload, authenticated = false, sentOrigin = origin) {
    const response = await fetch(origin + path, { method: payload ? 'POST' : 'GET', headers: { ...(payload ? { 'Content-Type': 'application/json', Origin: sentOrigin } : {}), ...(authenticated ? { Cookie: cookie } : {}) }, ...(payload ? { body: JSON.stringify(payload) } : {}) });
    return { response, data: await response.json() };
  }
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) { try { const r = await fetch(origin + '/api/booking'); if (r.ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 200)); }
    assert(ready, output);
    assert.equal((await request('/api/admin')).response.status, 401);
    assert.equal((await request('/api/admin', { action: 'status', id: 'unknown', status: 'CONFIRMADA' })).response.status, 401);
    assert.equal((await request('/api/admin', { action: 'login', password }, false, 'https://malicious.example')).response.status, 403);
    assert.equal((await request('/api/admin', { action: 'login', password: 'incorrect' })).response.status, 401);
    const login = await request('/api/admin', { action: 'login', password });
    assert.equal(login.response.status, 200);
    const session = login.response.headers.get('set-cookie');
    assert(session.includes('HttpOnly') && session.includes('Secure') && session.includes('SameSite=strict'));
    cookie = session.split(';')[0];
    assert.equal((await request('/api/admin', undefined, true)).response.status, 200);
    assert.equal((await request('/api/admin', { kind: 'settings', value: { enabled: true, nightly: 36000, cleaning: 15000, maxGuests: 8, depositPercent: 50, whatsapp: '5532999943917', privacyUrl: '' } }, true)).response.status, 200);
    const checkIn = `${new Date().getFullYear() + 1}-10-10`, checkOut = `${new Date().getFullYear() + 1}-10-13`;
    const q = await request('/api/booking', { action: 'quote', checkIn, checkOut, coupon: '' });
    assert.equal(q.response.status, 200); assert.equal(q.data.total, 123000);
    const payload = { checkIn, checkOut, adults: 1, children: 0, pets: 0, responsible: { name: 'Teste Integração', cpf: '52998224725', birthDate: '1990-01-01', phone: '32999943917', email: 'teste@example.com' }, guests: [], coupon: '', consent: true, idempotencyKey: randomUUID(), quoteToken: q.data.token };
    const a = await request('/api/booking', payload); assert.equal(a.response.status, 201); assert.equal(a.data.status, 'PENDENTE');
    const retry = await request('/api/booking', payload); assert.equal(retry.data.id, a.data.id);
    const b = await request('/api/booking', { ...payload, idempotencyKey: randomUUID() }); assert.equal(b.response.status, 201);
    let dates = await request('/api/calendar'); assert.deepEqual(dates.data.unavailableDates, []);
    assert(!JSON.stringify(dates.data).includes(payload.responsible.cpf));
    assert.equal((await fetch(origin + '/api/booking/' + a.data.id)).status, 404);
    const admin = await request('/api/admin', undefined, true);
    assert.equal(admin.data.bookings.length, 2); assert.equal(admin.data.bookings[0].input.responsible.cpf, payload.responsible.cpf);
    assert.equal((await request('/api/admin', { action: 'status', id: a.data.id, status: 'AGUARDANDO_SINAL' }, true)).response.status, 200);
    dates = await request('/api/calendar'); assert.deepEqual(dates.data.unavailableDates, []);
    const payment = { amount: 50000, date: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()), method: 'PIX', note: 'Pagamento de teste' };
    assert.equal((await request('/api/admin', { action: 'status', id: a.data.id, status: 'CONFIRMADA', payment, received: true }, true)).response.status, 200);
    dates = await request('/api/calendar'); assert.equal(dates.data.confirmedDates.length, 3); assert(!dates.data.unavailableDates.includes(checkOut));
    assert.equal((await request('/api/admin', { action: 'status', id: b.data.id, status: 'AGUARDANDO_SINAL' }, true)).response.status, 200);
    assert.equal((await request('/api/admin', { action: 'status', id: b.data.id, status: 'CONFIRMADA', payment, received: true }, true)).response.status, 409);
    assert.equal((await request('/api/booking', { ...payload, idempotencyKey: randomUUID() })).response.status, 409);
    assert.equal((await request('/api/admin', { action: 'status', id: a.data.id, status: 'CANCELADA' }, true)).response.status, 200);
    dates = await request('/api/calendar'); assert.deepEqual(dates.data.unavailableDates, []);
    const home = await fetch(origin); assert.equal(home.status, 200); assert((await home.text()).includes('Planeje seu descanso'));
    const adminPage = await fetch(origin + '/admin'); assert((await adminPage.text()).includes('Acesso do proprietário'));
    await request('/api/admin', { action: 'logout' }, true);
    assert.equal((await request('/api/admin', undefined, true)).response.status, 401);
  } finally {
    server.kill(); feed.close(); await postgres.stop();
  }
});
