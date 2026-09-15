// Optional visual smoke check using an installed Chromium browser; no production data.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { tmpdir } = require('node:os');
const { randomBytes, scryptSync } = require('node:crypto');
const { startPostgres } = require('../tests/postgres.cjs');
const pause = ms => new Promise(r => setTimeout(r, ms));
async function freePort() { const s = createServer(); s.listen(0, '127.0.0.1'); await once(s, 'listening'); const p = s.address().port; await new Promise(r => s.close(r)); return p; }
async function main() {
  const postgres = await startPostgres();
  const temp = mkdtempSync(join(tmpdir(), 'cangumbim-browser-'));
  const screenshots = resolve('data/browser-smoke'); mkdirSync(screenshots, { recursive: true });
  const feed = createServer((req, res) => res.end('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n'));
  feed.listen(0, '127.0.0.1'); await once(feed, 'listening');
  const port = await freePort(), debugPort = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const password = randomBytes(24).toString('hex'), salt = randomBytes(16).toString('hex');
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { windowsHide: true, stdio: 'ignore', env: { ...process.env, APP_ORIGIN: origin, DATABASE_URL: postgres.url, AIRBNB_ICAL_URL: `http://127.0.0.1:${feed.address().port}`, ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString('hex')}` } });
  let browser, socket;
  try {
    for (let i = 0; i < 100; i++) { try { if ((await fetch(origin + '/api/booking')).ok) break; } catch {} await pause(200); }
    const login = await fetch(origin + '/api/admin', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', password }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const config = await fetch(origin + '/api/admin', { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'settings', value: { enabled: true, nightly: 36000, cleaning: 15000, depositPercent: 50, maxGuests: 8, whatsapp: '5532999943917', privacyUrl: '' } }) });
    assert.equal(config.status, 200);
    browser = spawn(process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${join(temp, 'browser')}`, `--remote-debugging-port=${debugPort}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let target;
    for (let i = 0; i < 100; i++) { try { target = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(p => p.type === 'page'); if (target) break; } catch {} await pause(200); }
    assert(target, 'Browser did not start');
    socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const pending = new Map(); let sequence = 0;
    socket.onmessage = event => { const value = JSON.parse(event.data); if (value.id && pending.has(value.id)) { const { resolve, reject } = pending.get(value.id); pending.delete(value.id); value.error ? reject(new Error(value.error.message)) : resolve(value.result); } };
    function command(method, params = {}) { return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); }); }
    async function evaluate(expression) { const value = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (value.exceptionDetails) throw new Error(value.exceptionDetails.text); return value.result.value; }
    async function until(expression) { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(100); } throw new Error(`Browser condition failed: ${expression}`); }
    async function field(label, value) { await evaluate(`(() => { const label = [...document.querySelectorAll('label')].find(e => e.querySelector('span')?.textContent === ${JSON.stringify(label)}); const input = label?.querySelector('input'); if (!input) throw new Error('Field missing'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`); }
    async function click(label) { await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b || b.disabled) throw new Error('Button unavailable'); b.click(); })()`); }
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await command('Page.navigate', { url: origin + '/#reservas' });
    await until(`!!document.querySelector('#reservas') && [...document.querySelectorAll('button')].some(b => b.textContent === 'Consultar disponibilidade' && !b.disabled)`);
    const year = new Date().getFullYear() + 1;
    await field('Check-in', `${year}-10-10`); await field('Check-out', `${year}-10-13`);
    await click('Consultar disponibilidade'); await until(`document.querySelector('#reservas h3[tabindex]')?.textContent === 'Hóspedes'`);
    await click('Continuar'); await until(`document.querySelector('#reservas h3[tabindex]')?.textContent === 'Responsável'`);
    await field('Nome completo', 'Pessoa de Teste'); await field('CPF', '52998224725'); await field('Data de nascimento', '1990-01-01'); await field('WhatsApp / telefone', '32999943917'); await field('E-mail', 'teste@example.com');
    await click('Continuar'); await until(`document.querySelector('#reservas h3[tabindex]')?.textContent === 'Demais hóspedes'`);
    await click('Continuar'); await until(`document.querySelector('#reservas h3[tabindex]')?.textContent === 'Resumo'`);
    assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Mobile horizontal overflow');
    assert(await evaluate(`document.querySelector('#reservas').textContent.includes('1.230,00')`), 'Missing server price');
    await evaluate(`document.querySelector('#reservas h3[tabindex]').scrollIntoView({block:'start'})`);
    writeFileSync(join(screenshots, 'mobile-summary.png'), Buffer.from((await command('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await command('Page.navigate', { url: origin + '/admin' });
    await until(`document.querySelector('input[type=password]') !== null`);
    await field('Senha', password); await click('Entrar');
    await until(`document.body.textContent.includes('Tarifas e configurações')`);
    assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Admin horizontal overflow');
    writeFileSync(join(screenshots, 'mobile-admin.png'), Buffer.from((await command('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await click('Tarifas e configurações'); await until(`document.body.textContent.includes('Configurações da hospedagem')`);
    assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Configuration horizontal overflow');
    console.log('Browser checks passed: five public steps, server price, admin login and mobile width. Screenshots: data/browser-smoke/');
  } finally { socket?.close(); browser?.kill(); server.kill(); feed.close(); await postgres.stop(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
