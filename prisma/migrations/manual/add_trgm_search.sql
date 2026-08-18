CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_title_trgm_idx
  ON "Product" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_brand_trgm_idx
  ON "Product" USING gin (brand gin_trgm_ops);
