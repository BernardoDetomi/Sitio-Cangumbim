# Sítio Cangumbim

Site em Next.js hospedado na Vercel, com PostgreSQL no Neon, solicitações de reserva, calendário Airbnb e painel administrativo.

Consulte [instalação, arquitetura e operação das reservas](docs/RESERVAS.md).

```sh
npm ci
# Configure .env.local antes de aplicar as migrações.
npm run db:migrate
npm run dev
```

Configure `.env.local` a partir de `.env.example`, incluindo `DATABASE_URL`, e defina uma senha administrativa antes de usar `/admin`. Na Vercel, configure as mesmas variáveis e aplique as migrações no Neon antes do deploy. As solicitações públicas precisam ser habilitadas no painel após cadastrar os preços reais.

Se houver dados no SQLite anterior, o guia inclui a importação opcional com `npm run db:import-sqlite`.
