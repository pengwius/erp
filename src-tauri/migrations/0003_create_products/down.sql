BEGIN;

DROP INDEX IF EXISTS idx_product_prices_validity;
DROP INDEX IF EXISTS idx_product_prices_product_currency;
DROP INDEX IF EXISTS idx_product_prices_product;

DROP INDEX IF EXISTS idx_products_company_ean;
DROP INDEX IF EXISTS idx_products_company_name;
DROP INDEX IF EXISTS ux_products_company_sku;

DROP TABLE IF EXISTS product_prices;
DROP TABLE IF EXISTS products;

COMMIT;
