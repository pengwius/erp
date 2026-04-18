-- Sample Database Data

INSERT OR IGNORE INTO companies (
    id, name, nip, street, city, postal_code, country, short_name, currency, initial_balance, operator_name, created_at, ksef_connected
) VALUES (
    1001, 'Test Company Sp. z o.o.', '1234567890', 'Polna 1', 'Warszawa', '00-001', 'Polska', 'TestComp', 'PLN', '10000.00', 'Jan Kowalski', strftime('%Y-%m-%d %H:%M:%S', 'now'), 0
);

INSERT OR IGNORE INTO customers (
    id, company_id, name, nip, email, phone, street, city, postal_code, country, created_at
) VALUES (
    1001, 1001, 'Jan Nowak', '0987654321', 'jan.nowak@example.com', '123456789', 'Kwiatowa 2', 'Kraków', '30-002', 'Polska', strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO products (
    id, company_id, name, description, unit, is_service, is_active, created_at
) VALUES (
    1001, 1001, 'Super Gadget', 'A very useful gadget.', 'szt', 0, 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1001, 'Consulting Service', 'Expert advice.', 'h', 1, 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO product_prices (
    id, product_id, currency, price, valid_from, created_at
) VALUES (
    1001, 1001, 'PLN', '100.00', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now')
),
(
    1002, 1002, 'PLN', '200.00', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO warehouses (
    id, company_id, name, description, location_code_prefix, address, manager_name, is_active, created_at
) VALUES (
    1001, 1001, 'Main Warehouse', 'Central storage', 'MAIN', 'Polna 1, Warszawa', 'Anna Maria', 1, strftime('%Y-%m-%d %H:%M:%S', 'now')
);

INSERT OR IGNORE INTO stocks (
    id, product_id, warehouse_id, location_code, physical_quantity, reserved_quantity, available_quantity
) VALUES (
    1001, 1001, 1001, 'MAIN-A1', '100', '10', '90'
);
