CREATE TABLE settings (
  id integer PRIMARY KEY CHECK (id = 1),
  data jsonb NOT NULL
);
CREATE TABLE rates (
  id text PRIMARY KEY,
  data jsonb NOT NULL
);
CREATE TABLE coupons (
  code text PRIMARY KEY,
  data jsonb NOT NULL
);
CREATE TABLE bookings (
  id text PRIMARY KEY,
  request_key text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDENTE', 'AGUARDANDO_SINAL', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA')),
  check_in date NOT NULL,
  check_out date NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status = 'CONFIRMADA')
);
CREATE INDEX booking_dates ON bookings (status, check_in, check_out);
CREATE INDEX booking_created ON bookings (created_at DESC);
CREATE TABLE sessions (
  token text PRIMARY KEY,
  expires bigint NOT NULL
);
CREATE INDEX session_expiry ON sessions (expires);
CREATE TABLE attempts (
  key text PRIMARY KEY,
  count integer NOT NULL,
  expires bigint NOT NULL
);
INSERT INTO settings (id, data) VALUES (1, '{"enabled":false,"nightly":0,"cleaning":0,"nightlyTwoGuests":0,"cleaningTwoGuests":0,"depositPercent":50,"maxGuests":8,"whatsapp":"5532999943917","privacyUrl":""}');
