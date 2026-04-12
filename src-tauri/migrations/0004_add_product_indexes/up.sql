PRAGMA foreign_keys = OFF;

CREATE INDEX IF NOT EXISTS idx_products_company_ean ON products (company_id, ean);
CREATE INDEX IF NOT EXISTS idx_products_company_name ON products (company_id, name);
CREATE INDEX IF NOT EXISTS ux_products_company_sku ON products (company_id, sku);

CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_currency ON product_prices (product_id, currency);
CREATE INDEX IF NOT EXISTS idx_product_prices_validity ON product_prices (product_id, currency, valid_from, valid_to);

UPDATE products
SET currency = 'PLN'
WHERE (currency IS NULL) OR (TRIM(currency) = '');

UPDATE product_prices
SET currency = 'PLN'
WHERE (currency IS NULL) OR (TRIM(currency) = '');

PRAGMA foreign_keys = ON;
