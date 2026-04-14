PRAGMA foreign_keys = ON;

CREATE TABLE companies (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    nip TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    short_name TEXT,
    regon TEXT,
    building_number TEXT,
    flat_number TEXT,
    county TEXT,
    post_office TEXT,
    po_box TEXT,
    voivodeship TEXT,
    website TEXT,
    email TEXT,
    currency TEXT DEFAULT 'PLN',
    initial_balance TEXT DEFAULT '0.00',
    operator_name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ksef_connected BOOLEAN NOT NULL DEFAULT 0,
    ksef_metadata TEXT
);

CREATE TABLE customers (
    id INTEGER PRIMARY KEY NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nip TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    email TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE TABLE invoices (
    id INTEGER PRIMARY KEY NOT NULL,
    issuer_company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    seller_company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    buyer_company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    invoice_type TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    sale_date TEXT,
    due_date TEXT,
    currency TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_nip TEXT,
    seller_country TEXT,
    seller_street TEXT,
    seller_building_number TEXT,
    seller_flat_number TEXT,
    seller_city TEXT,
    seller_postal_code TEXT,
    buyer_name TEXT NOT NULL,
    buyer_nip TEXT,
    buyer_country TEXT,
    buyer_street TEXT,
    buyer_building_number TEXT,
    buyer_flat_number TEXT,
    buyer_city TEXT,
    buyer_postal_code TEXT,
    net_amount TEXT,
    tax_amount TEXT,
    gross_amount TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE TABLE invoice_lines (
    id INTEGER PRIMARY KEY NOT NULL,
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

CREATE TABLE products (
    id INTEGER PRIMARY KEY NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku TEXT,
    ean TEXT,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
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
    currency TEXT,
    min_stock TEXT,
    stock TEXT,
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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

CREATE TABLE product_prices (
    id INTEGER PRIMARY KEY NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    price TEXT NOT NULL,
    valid_from TEXT NOT NULL,
    valid_to TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warehouses (
    id INTEGER PRIMARY KEY NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_code_prefix TEXT,
    description TEXT,
    address TEXT,
    manager_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stocks (
    id INTEGER PRIMARY KEY NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    location_code TEXT,
    physical_quantity TEXT NOT NULL DEFAULT '0',
    reserved_quantity TEXT NOT NULL DEFAULT '0',
    available_quantity TEXT NOT NULL DEFAULT '0'
);

CREATE TABLE stock_documents (
    id INTEGER PRIMARY KEY NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    source_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    target_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    issue_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_document_lines (
    id INTEGER PRIMARY KEY NOT NULL,
    document_id INTEGER NOT NULL REFERENCES stock_documents(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity TEXT NOT NULL,
    purchase_price TEXT
);

CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_invoices_issuer_company_id ON invoices(issuer_company_id);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_warehouses_company_id ON warehouses(company_id);
CREATE INDEX idx_stocks_product_id ON stocks(product_id);
CREATE INDEX idx_stocks_warehouse_id ON stocks(warehouse_id);
CREATE INDEX idx_stock_documents_company_id ON stock_documents(company_id);
CREATE INDEX idx_stock_document_lines_document_id ON stock_document_lines(document_id);
CREATE INDEX idx_stock_document_lines_product_id ON stock_document_lines(product_id);
