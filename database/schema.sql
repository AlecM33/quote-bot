CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE COLLATION ci (
  provider = 'icu',
  locale = 'utf-8@colStrength=secondary',
  deterministic = false
);

CREATE TABLE quotes(
    id SERIAL,
    quotation citext NOT NULL,
    author character varying(120) COLLATE ci NOT NULL,
    said_at date NOT NULL,
    guild_id character varying(64) NOT NULL,
    hash text NOT NULL PRIMARY KEY
);
