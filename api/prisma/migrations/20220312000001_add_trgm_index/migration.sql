CREATE EXTENSION IF NOT EXISTS pg_trgm ;

CREATE INDEX securities_name_trigram
  ON securities
  USING gin (name gin_trgm_ops);
