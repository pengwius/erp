CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  sku TEXT,
  ean TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  model TEXT,

  unit TEXT,
  vat_rate TEXT,
  cn_code TEXT,
  pkwiu TEXT,
  gtu_code TEXT,
  ksef_procedure TEXT,

  purchase_price_net TEXT,
  sale_price_net TEXT,
  currency TEXT DEFAULT 'PLN',

  min_stock NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0,
  is_service INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  weight_net TEXT,
  weight_gross TEXT,
  length TEXT,
  width TEXT,
  height TEXT,

  images TEXT,
  attributes TEXT,

  expiry_date TEXT,
  lot_number TEXT,
  country_of_origin TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_products_company_sku ON products (company_id, sku);

CREATE INDEX IF NOT EXISTS idx_products_company_name ON products (company_id, name);
CREATE INDEX IF NOT EXISTS idx_products_company_ean ON products (company_id, ean);

CREATE TABLE IF NOT EXISTS product_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  price TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_currency ON product_prices (product_id, currency);
CREATE INDEX IF NOT EXISTS idx_product_prices_validity ON product_prices (product_id, currency, valid_from, valid_to);
