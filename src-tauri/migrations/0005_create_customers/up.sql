CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    company_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    nip TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    email TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
