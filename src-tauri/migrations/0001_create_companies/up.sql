CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  nip TEXT,
  street TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ksef_connected BOOLEAN DEFAULT 0 NOT NULL,
  ksef_metadata TEXT
);

CREATE INDEX idx_companies_nip ON companies(nip);
CREATE INDEX idx_companies_created_at ON companies(created_at);
