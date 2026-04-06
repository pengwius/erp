-- up.sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issuer_company_id INTEGER NOT NULL,
  seller_company_id INTEGER,
  buyer_company_id INTEGER,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  sale_date TEXT,
  due_date TEXT,
  currency TEXT NOT NULL,
  -- Seller snapshot
  seller_name TEXT NOT NULL,
  seller_nip TEXT,
  seller_country TEXT,
  seller_street TEXT,
  seller_building_number TEXT,
  seller_flat_number TEXT,
  seller_city TEXT,
  seller_postal_code TEXT,
  -- Buyer snapshot
  buyer_name TEXT NOT NULL,
  buyer_nip TEXT,
  buyer_country TEXT,
  buyer_street TEXT,
  buyer_building_number TEXT,
  buyer_flat_number TEXT,
  buyer_city TEXT,
  buyer_postal_code TEXT,
  -- Totals
  net_amount TEXT,
  tax_amount TEXT,
  gross_amount TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE UNIQUE INDEX ux_invoices_issuer_number ON invoices (issuer_company_id, invoice_number);

CREATE TABLE invoice_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  measure_unit TEXT,
  quantity TEXT,
  net_price TEXT,
  tax_rate TEXT,
  line_net_total TEXT,
  line_tax_total TEXT,
  line_gross_total TEXT
);
