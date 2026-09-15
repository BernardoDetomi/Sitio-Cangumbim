import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
const terminal = createInterface({ input: process.stdin, output: process.stdout });
console.log('Execute em um terminal privado. A senha será visível enquanto você digita.');
const password = await terminal.question('Nova senha administrativa (mínimo 12 caracteres): ');
terminal.close();
if (password.length < 12) { console.error('Use pelo menos 12 caracteres.'); process.exitCode = 1; }
else { const salt = randomBytes(16).toString('hex'); console.log(`ADMIN_PASSWORD_HASH=${salt}:${scryptSync(password, salt, 64).toString('hex')}`); }
