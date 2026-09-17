# Plataforma de reservas — Sítio Cangumbim

## Vercel + PostgreSQL no Neon

O site permanece na Vercel. Reservas, hóspedes, cupons, tarifas, configurações, sessões administrativas e limites de tentativas ficam no **PostgreSQL do Neon**, compartilhado entre as instâncias da aplicação. A aplicação não grava um banco no filesystem da Vercel.

### 1. Criar e conectar o banco

1. No projeto da Vercel, abra **Storage / Marketplace** e adicione a integração **Neon**, ou crie o banco no console do Neon e configure as variáveis manualmente.
2. Escolha uma região próxima à região das funções da Vercel.
3. Copie a conexão **pooled**, cujo hostname contém `-pooler`, para `DATABASE_URL`.
4. Copie a conexão **direct/unpooled** para `DATABASE_URL_UNPOOLED`, usada pelas migrações. Se ela não estiver definida, o script usa `DATABASE_URL`.
5. Mantenha TLS na conexão. O exemplo usa `sslmode=verify-full`; não configure `rejectUnauthorized: false`.

Referências: [Neon no Marketplace da Vercel](https://vercel.com/marketplace/neon/neon), [pooling do Neon](https://neon.com/docs/connect/connection-pooling) e [TLS no node-postgres](https://node-postgres.com/features/ssl).

### 2. Configurar as variáveis

Copie `.env.example` para `.env.local` no computador. Substitua os valores de exemplo pelas conexões reais; não envie as senhas pelo chat nem as coloque no Git.

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL pooled usada pelas funções |
| `DATABASE_URL_UNPOOLED` | Conexão direta opcional para migração/importação |
| `ADMIN_PASSWORD_HASH` | Hash da senha do proprietário |
| `APP_ORIGIN` | Origem exata, sem barra final: `https://www.sitiocangumbim.com.br` em produção |
| `AIRBNB_ICAL_URL` | Opcional: substitui o feed iCal já utilizado pelo site |

Para criar a senha, execute em terminal privado:

```sh
node scripts/admin-password.mjs
```

Copie o hash gerado para `ADMIN_PASSWORD_HASH`. Não há senha padrão. Localmente, use `APP_ORIGIN=http://localhost:3000`.

Cadastre as mesmas variáveis em **Settings → Environment Variables** da Vercel, no ambiente correspondente. Variáveis de banco e de autenticação são exclusivamente do servidor: nunca use prefixo `NEXT_PUBLIC_`.

Use banco/branch separado para **Preview e Development**. Não conecte testes ou previews ao banco de produção. Cada preview precisa de um `APP_ORIGIN` correspondente ao seu endereço; para previews variáveis, omita essa variável no ambiente Preview e a validação usará a origem da requisição. Em produção, defina a origem canônica explicitamente e redirecione domínios alternativos para ela.

### 3. Criar as tabelas

Com Node.js 24.13+ e as dependências instaladas:

```sh
npm ci
npm run db:migrate
```

O comando carrega `.env.local`, aplica os SQLs de `migrations/` em transação e registra versão/checksum em `schema_migrations`. Pode ser repetido: migrações já aplicadas não são executadas outra vez e os preços configurados não são resetados. Não edite um SQL já aplicado; crie o próximo arquivo numerado.

A migração precisa ser executada no banco de cada ambiente antes de ativar suas funções. Ela **não roda automaticamente no build ou em requisições públicas**, para evitar que previews ou execuções simultâneas alterem o schema de produção. O build não precisa de conexão com o banco.

Também é possível aplicar a migração por uma etapa de CI controlada com a conexão direta do ambiente escolhido.

### 4. Publicar e ativar

```sh
npm run build
```

Faça o deploy pela integração Git já utilizada na Vercel, após configurar as variáveis e aplicar a migração. Alterações nas variáveis da Vercel exigem um novo deployment para serem usadas pelas funções.

Acesse `/admin`, entre com a senha e configure:

- diária padrão e limpeza;
- percentual previsto do sinal;
- capacidade, limitada aos oito hóspedes do sítio;
- WhatsApp e, quando disponível, link HTTPS da Política de Privacidade;
- tarifas especiais e cupons.

Marque **Abrir solicitações pelo site**. O banco começa com solicitações desativadas e preços em zero, evitando publicar valores ilustrativos. Nenhum cupom promocional é criado automaticamente.

Não é necessário instalar PostgreSQL na Vercel, montar disco ou enviar arquivos `.sqlite`. O driver `pg` usa o runtime Node.js das funções; não configure estas rotas para Edge Runtime.

## Importar dados do SQLite anterior (opcional)

Se já cadastrou dados na versão local, use um destino Neon **recém-migrado, vazio e sem configurações alteradas**:

```sh
npm run db:import-sqlite -- ./data/bookings.sqlite
```

O comando carrega as conexões de `.env.local`. Antes de executá-lo, pare os envios/alterações na versão antiga e mantenha um backup consistente do SQLite, incluindo seu WAL quando aplicável. A leitura usa um snapshot do SQLite e não altera o arquivo original.

O importador preserva IDs, hóspedes, orçamento, status, sinal, consentimento, histórico, timestamps, tarifas, configurações e usos de cupons. Toda a gravação no PostgreSQL é feita em uma transação. Um destino ocupado, registros inconsistentes ou reservas confirmadas sobrepostas interrompem a importação; nenhuma importação parcial é mantida. Sessões antigas e tentativas de login não são transferidas: faça login novamente.

O único uso restante de `node:sqlite` é esse utilitário opcional e seu teste. Ele não faz parte das funções publicadas. `BOOKING_DB_PATH` deixou de ser utilizado.

## Arquitetura

O projeto usa Next.js App Router, React, TypeScript e Tailwind. A implementação original não possuía banco ou autenticação e usava `/api/calendar` para ler o iCal do Airbnb. Os componentes de apresentação, imagens, fontes, cores e a âncora `#reservas` foram preservados.

- `src/lib/booking/db.ts`: pool PostgreSQL, consultas assíncronas, transações e persistência.
- `migrations/001_reservations.sql`: schema PostgreSQL e proteção contra sobreposição.
- `scripts/migrate.mjs`: migrações versionadas, transacionais e repetíveis.
- `validation.ts`: datas civis, CPF, idade, capacidade e dados obrigatórios.
- `calendar.ts`: feed iCal e intervalos confirmados, sem carregar dados pessoais para o calendário.
- `service.ts`: tarifas, cupons, orçamento, criação idempotente, transições e mensagem WhatsApp.
- `auth.ts` / `http.ts`: sessão, limites de tentativas, origem e tamanho de requisição.
- `src/components/reservations`: calendário, campos, resumo e painel.
- `/api/booking`: configuração pública mínima, cotação e criação; não oferece consulta pública por ID.
- `/api/admin`: leitura e alterações autenticadas.
- `/api/calendar`: apenas datas e origem dos bloqueios.

### Modelo de dados

`bookings` representa uma solicitação durante todo seu ciclo. Os dados dos hóspedes, orçamento, consentimento v1, histórico e sinal são armazenados em JSONB validado pelo backend; status, intervalo e timestamps também possuem colunas para consultas e restrições. Isso evita duplicar solicitações e reservas em tabelas diferentes.

`rates`, `coupons`, `settings`, `sessions`, `attempts` e `schema_migrations` completam o modelo. Valores monetários são centavos inteiros. JSONB não preserva a ordem das chaves de objetos; a verificação de reenvios compara conteúdo, não a ordem serializada.

### Transações e concorrência na Vercel

As escritas de reservas e configurações usam uma conexão dedicada do pool durante toda a transação e um `pg_advisory_xact_lock` compartilhado para o sítio. O contexto assíncrono garante que todas as consultas da operação utilizem essa conexão. O lock vale no PostgreSQL, inclusive quando as requisições chegam a instâncias diferentes da Vercel, e é liberado no commit/rollback. Esse bloqueio transacional não reserva datas nem cria retenções de calendário.

A consulta externa ao Airbnb ocorre antes da transação. Dentro dela, a disponibilidade direta, os preços, a capacidade e os usos de cupom são verificados novamente. Inserção, consumo de cupom e alterações de status são atômicos. A limitação de tentativas usa um upsert atômico separado.

A restrição `bookings_no_overlap` usa `EXCLUDE USING gist (daterange(check_in, check_out, '[)') WITH &&) WHERE (status = 'CONFIRMADA')`. O PostgreSQL rejeita sobreposições confirmadas mesmo se uma escrita não passar pelo serviço da aplicação. Não é necessária extensão adicional para um único imóvel. Referência: [tipos de intervalo e exclusão no PostgreSQL](https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT).

O pool local é pequeno e libera conexões ociosas rapidamente; a URL pooled do Neon permite compartilhar conexões no servidor. Consultas de uma transação nunca são executadas alternando clientes do pool.

## Regras da reserva

```text
PENDENTE → AGUARDANDO_SINAL → CONFIRMADA → FINALIZADA
    └────────────┴───────────────┴──────→ CANCELADA
```

- **Somente `CONFIRMADA` bloqueia noites.** Pendentes e aguardando sinal permitem outras solicitações.
- O proprietário registra valor, data, forma de pagamento e observação opcional, e confirma explicitamente o recebimento do sinal.
- O check-out é exclusivo: de 10 a 13 bloqueia as noites de 10, 11 e 12; outra reserva pode entrar dia 13.
- Finalização só é permitida a partir do check-out. Cancelamento libera o bloqueio direto; um bloqueio simultâneo do Airbnb permanece.
- Falha no Airbnb, calendário malformado ou recorrência não suportada impedem cotar, solicitar e confirmar; não são interpretados como disponibilidade.
- iCal não oferece transação distribuída com o Airbnb: uma mudança externa posterior à consulta ainda pode gerar conflito. Não há exportação automática das reservas diretas para o Airbnb nesta versão.
- Capacidade inicial: oito pessoas, incluindo crianças. Responsável maior de idade. Menores de 18 anos no check-in contam como crianças. CPF obrigatório para todos nesta versão.
- Tarifa especial substitui a padrão por noite; períodos especiais não podem se sobrepor e seu fim é exclusivo. Para 2 adultos ou 2 adultos + 1 criança, o painel permite definir uma diária e uma taxa de limpeza próprias; essa regra é aplicada quando não houver tarifa especial por período.
- Cupom percentual ou fixo incide sobre diárias + limpeza, limitado ao subtotal. Validade inclusiva pela data da solicitação no fuso de São Paulo; limite zero significa ilimitado.
- Cada solicitação salva consome um uso do cupom, mesmo pendente. Cancelamentos não devolvem usos. Reenvio idempotente não consome outro uso.
- O servidor recalcula o orçamento ao salvar e rejeita valores desatualizados. Solicitações salvas mantêm os preços originais. O sinal previsto é percentual; o administrador pode registrar outro valor recebido, até o total.
- O ID identifica a solicitação sem permitir consulta pública. Uma chave aleatória mantida na página evita duplicatas no reenvio; recarregar inicia nova solicitação.
- O WhatsApp abre somente após salvar. O recibo oferece um botão para continuar se o navegador não abrir o aplicativo. Não há envio automático de mensagens ou pagamento online.

## Dados pessoais e operação

Somente a API administrativa autenticada lista dados completos. O calendário contém apenas datas. O cliente recebe o recibo da própria solicitação e sua mensagem. Não são usados armazenamento local do navegador, analytics ou logs com dados dos hóspedes. A mensagem WhatsApp inclui os dados solicitados, conforme avisado no formulário.

O cookie administrativo é `HttpOnly`, `SameSite=Strict`, `Secure` em produção e expira em oito horas. As sessões persistem no Neon, permitindo atendimento por qualquer instância da Vercel. A senha usa scrypt. Para revogar todas as sessões depois de trocar a senha, execute `DELETE FROM sessions` no SQL Editor do banco correto.

Há limite global de 10 tentativas de login por 15 minutos e 100 envios públicos por hora. São controles básicos para o MVP; os contadores ficam no PostgreSQL e não dependem da memória de uma função.

Consentimento e data/versão são registrados. A política pode ser ligada pelo painel. O proprietário deve definir o procedimento operacional de retenção/exclusão e verificar as opções de backup/restauração disponíveis na sua conta Neon. Não há exclusão automática nesta implementação.

## Verificações

```sh
npm run lint
npm test
npm run build
npm run test:http
# Opcional: Edge no Windows, ou Chromium definido em BROWSER_PATH
npm run test:browser
```

`lint` executa a checagem TypeScript. O projeto tinha `next lint` e configuração antiga de ESLint; não foi feita migração geral do lint.

Os testes iniciam **PostgreSQL real temporário**, usando `embedded-postgres` como dependência de desenvolvimento. Cada suíte cria seu próprio cluster local, aplica as mesmas migrações e usa credenciais aleatórias. Eles não leem a conexão de produção. A máquina precisa permitir executar processos e abrir uma porta de loopback; no Linux, execute como usuário comum. O encerramento usa `pg_ctl` e não instala um serviço no sistema.

Cobertura: status, concorrência, restrição SQL, rollback, cupons, orçamentos, validação, JSONB, idempotência, importação legada e repetição de migrações. Os testes HTTP exercitam o build de produção, sessão, origem, privacidade, confirmação, conflito, cancelamento e logout, com iCal fictício.

O smoke visual percorre as cinco etapas e o login em 390 px, sem enviar mensagens. Capturas ficam em `data/browser-smoke/`. Antes da publicação, confira as tarifas reais, o feed real, a abertura do WhatsApp em iOS/Android e a configuração do ambiente Neon/Vercel.

## Fora do MVP

Gateway, checkout, PIX automático, contrato digital, FNRH, lembretes, exportação iCal e automação de mensagens não foram implementados.
