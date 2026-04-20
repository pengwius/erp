INSERT OR IGNORE INTO companies (
    id, name, nip, street, building_number, flat_number, city, postal_code, country,
    short_name, currency, initial_balance, operator_name, created_at, ksef_connected
) VALUES (
    1001, 'Tech-Pro Sp. z o.o.', '1112223344', 'Złota', '44', '12', 'Warszawa', '00-120', 'Polska',
    'Tech-Pro', 'PLN', '50000.00', 'Jan Kowalski', strftime('%Y-%m-%d %H:%M:%S', 'now'), 0
),
(
    1002, 'Bud-Expert S.A.', '9998887766', 'Wrocławska', '15', NULL, 'Kraków', '31-000', 'Polska',
    'Bud-Expert', 'PLN', '10000.00', 'Michał Budowniczy', strftime('%Y-%m-%d %H:%M:%S', 'now'), 0
);

INSERT OR IGNORE INTO customers (
    id, company_id, name, nip, email, phone, street, building_number, flat_number, city, postal_code, country, created_at
) VALUES (
    1001, 1001, 'Sklep Komputerowy "Bajt"', '5556667788', 'kontakt@bajt.pl', '500600700', 'Kwiatowa', '12', '3', 'Poznań', '60-100', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1001, 'Hurtownia RTV-AGD', '1234567890', 'biuro@hurt-rtv.pl', '987654321', 'Przemysłowa', '100', NULL, 'Gdańsk', '80-200', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1003, 1001, 'Jan Nowak (Osoba Prywatna)', NULL, 'jan.nowak@gmail.com', '111222333', 'Długa', '5', '14', 'Warszawa', '00-001', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1004, 1002, 'Firma Remontowa "Kafel"', '5544332211', 'kafel@remonty.pl', '500600700', 'Spożywcza', '1', '1A', 'Wrocław', '50-001', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO products (
    id, company_id, sku, ean, name, description, short_description, category, brand, model, unit, vat_rate,
    cn_code, pkwiu, gtu_code, purchase_price_net, sale_price_net, currency, min_stock, stock,
    is_service, is_active, weight_net, weight_gross, length, width, height, country_of_origin, created_at
) VALUES (
    1001, 1001, 'LAP-001', '5901234560011', 'Laptop ProBook 15', 'Wydajny laptop do biura, 16GB RAM, 512GB SSD.', 'Laptop biznesowy', 'Elektronika', 'ProBrand', 'PB-15', 'szt', '23',
    '84713000', '26.20.11.0', 'GTU_07', '2500.00', '3499.00', 'PLN', '5', '50', 0, 1, '1.8', '2.5', '35.0', '25.0', '2.0', 'Chiny', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1001, 'MYSZ-002', '5901234560028', 'Myszka bezprzewodowa Silent', 'Cicha myszka bezprzewodowa na Bluetooth.', 'Myszka BT', 'Akcesoria', 'ProBrand', 'Silent-M', 'szt', '23',
    '84716070', '26.20.16.0', 'GTU_07', '40.00', '89.99', 'PLN', '20', '150', 0, 1, '0.1', '0.2', '10.0', '6.0', '3.5', 'Tajwan', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1003, 1001, 'SRV-001', NULL, 'Instalacja systemu Windows', 'Usługa instalacji i konfiguracji systemu.', 'Instalacja OS', 'Usługi', 'IT-Service', NULL, 'usł', '23',
    NULL, '62.02.30.0', 'GTU_12', '0.00', '150.00', 'PLN', '0', '0', 1, 1, NULL, NULL, NULL, NULL, NULL, 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1004, 1002, 'CEM-42', '5909876543210', 'Cement Ożarów 42,5', 'Wysokiej klasy cement budowlany 25kg.', 'Cement 25kg', 'Materiały', 'Ożarów', '42,5R', 'worek', '23',
    '25232900', '23.51.12.0', NULL, '15.00', '22.50', 'PLN', '50', '200', 0, 1, '25.0', '25.1', '60.0', '40.0', '15.0', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO product_prices (id, product_id, currency, price, valid_from, created_at) VALUES
(1001, 1001, 'PLN', '3499.00', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now')),
(1002, 1002, 'PLN', '89.99', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now')),
(1003, 1003, 'PLN', '150.00', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now')),
(1004, 1004, 'PLN', '22.50', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now'));

INSERT OR IGNORE INTO warehouses (
    id, company_id, name, description, location_code_prefix, address, manager_name, is_active, created_at
) VALUES (
    1001, 1001, 'Magazyn Centralny', 'Główny magazyn dystrybucyjny', 'MAG-CEN', 'Złota 44, 00-120 Warszawa', 'Piotr Magazynier', 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1001, 'Magazyn Części', 'Magazyn serwisowy', 'MAG-SRV', 'Złota 44/B, 00-120 Warszawa', 'Anna Nowak', 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1003, 1002, 'Plac Budowy', 'Materiały masowe', 'PLAC-1', 'Wrocławska 15, Kraków', 'Krzysztof Hak', 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO warehouse_locations (
    id, warehouse_id, zone, rack, shelf, bin, barcode
) VALUES (
    1001, 1001, 'Elektronika', 'A01', 'P1', 'G01', 'LOC-A01-P1-G01'
),
(
    1002, 1001, 'Akcesoria', 'B02', 'P4', 'G15', 'LOC-B02-P4-G15'
),
(
    1003, 1003, 'Sektor A (Zadaszony)', '1', 'Podłoga', 'Paleta 1', 'PLAC-A-PAL1'
);

INSERT OR IGNORE INTO stocks (
    id, product_id, warehouse_id, location_id, physical_quantity, reserved_quantity, available_quantity
) VALUES (
    1001, 1001, 1001, 1001, '50', '5', '45'
),
(
    1002, 1002, 1001, 1002, '150', '0', '150'
),
(
    1003, 1004, 1003, 1003, '200', '0', '200'
);

INSERT OR IGNORE INTO invoices (
    id, issuer_company_id, invoice_number, invoice_type, document_type, issue_date,
    currency, seller_name, seller_nip, seller_country, seller_city, buyer_name, buyer_nip, buyer_country, buyer_city,
    net_amount, tax_amount, gross_amount, warehouse_id, status, created_at
) VALUES (
    1001, 1001, 'FV/2026/04/0001', 'fa_3', 'invoice', '2026-04-10',
    'PLN', 'Tech-Pro Sp. z o.o.', '1112223344', 'PL', 'Warszawa', 'Sklep Komputerowy "Bajt"', '5556667788', 'PL', 'Poznań',
    '3499.00', '804.77', '4303.77', 1001, 'issued', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1001, 'PAR/2026/04/0001', 'receipt', 'receipt', '2026-04-11',
    'PLN', 'Tech-Pro Sp. z o.o.', '1112223344', 'PL', 'Warszawa', 'Jan Nowak (Osoba Prywatna)', NULL, 'PL', 'Warszawa',
    '89.99', '20.70', '110.69', 1001, 'issued', strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1003, 1001, 'FV/2026/04/0002', 'fa_3', 'invoice', '2026-04-12',
    'PLN', 'Tech-Pro Sp. z o.o.', '1112223344', 'PL', 'Warszawa', 'Hurtownia RTV-AGD', '1234567890', 'PL', 'Gdańsk',
    '34990.00', '8047.70', '43037.70', 1001, 'draft', strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO invoice_lines (
    id, invoice_id, position, product_id, name, measure_unit, quantity, net_price, tax_rate, line_net_total, line_tax_total, line_gross_total
) VALUES (
    1001, 1001, 1, 1001, 'Laptop ProBook 15', 'szt', '1', '3499.00', '23', '3499.00', '804.77', '4303.77'
),
(
    1002, 1002, 1, 1002, 'Myszka bezprzewodowa Silent', 'szt', '1', '89.99', '23', '89.99', '20.70', '110.69'
),
(
    1003, 1003, 1, 1001, 'Laptop ProBook 15', 'szt', '10', '3499.00', '23', '34990.00', '8047.70', '43037.70'
);

INSERT OR IGNORE INTO warehouse_documents (
    id, document_number, document_type, issue_date, status, related_invoice_id
) VALUES (
    1001, 'WZ/FV-2026-04-0001', 'WZ', '2026-04-10', 'issued', 1001
),
(
    1002, 'WZ/PAR-2026-04-0001', 'WZ', '2026-04-11', 'issued', 1002
);

INSERT OR IGNORE INTO warehouse_document_lines (
    id, warehouse_document_id, product_id, quantity
) VALUES (
    1001, 1001, 1001, '1'
),
(
    1002, 1002, 1002, '1'
);
