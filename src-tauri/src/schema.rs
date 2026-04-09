/*
    @generated automatically by Diesel CLI.

    Extended schema for products to support ecommerce, inventory and metadata fields.
    Compatible with Diesel's `64-column-tables` feature.
*/

diesel::table! {
    companies (id) {
        id -> Integer,
        name -> Text,
        nip -> Nullable<Text>,
        street -> Nullable<Text>,
        city -> Nullable<Text>,
        postal_code -> Nullable<Text>,
        country -> Nullable<Text>,
        created_at -> Timestamp,
        ksef_connected -> Bool,
        ksef_metadata -> Nullable<Text>,
    }
}

diesel::table! {
    invoices (id) {
        id -> Integer,
        issuer_company_id -> Integer,
        seller_company_id -> Nullable<Integer>,
        buyer_company_id -> Nullable<Integer>,
        invoice_number -> Text,
        invoice_type -> Text,
        issue_date -> Text,
        sale_date -> Nullable<Text>,
        due_date -> Nullable<Text>,
        currency -> Text,
        seller_name -> Text,
        seller_nip -> Nullable<Text>,
        seller_country -> Nullable<Text>,
        seller_street -> Nullable<Text>,
        seller_building_number -> Nullable<Text>,
        seller_flat_number -> Nullable<Text>,
        seller_city -> Nullable<Text>,
        seller_postal_code -> Nullable<Text>,
        buyer_name -> Text,
        buyer_nip -> Nullable<Text>,
        buyer_country -> Nullable<Text>,
        buyer_street -> Nullable<Text>,
        buyer_building_number -> Nullable<Text>,
        buyer_flat_number -> Nullable<Text>,
        buyer_city -> Nullable<Text>,
        buyer_postal_code -> Nullable<Text>,
        net_amount -> Nullable<Text>,
        tax_amount -> Nullable<Text>,
        gross_amount -> Nullable<Text>,
        created_at -> Text,
        updated_at -> Nullable<Text>,
    }
}

diesel::table! {
    invoice_lines (id) {
        id -> Integer,
        invoice_id -> Integer,
        position -> Integer,
        name -> Text,
        measure_unit -> Nullable<Text>,
        quantity -> Nullable<Text>,
        net_price -> Nullable<Text>,
        tax_rate -> Nullable<Text>,
        line_net_total -> Nullable<Text>,
        line_tax_total -> Nullable<Text>,
        line_gross_total -> Nullable<Text>,
    }
}

diesel::table! {
    products (id) {
        id -> Integer,
        company_id -> Integer,
        sku -> Nullable<Text>,
        ean -> Nullable<Text>,
        name -> Text,
        description -> Nullable<Text>,
        category -> Nullable<Text>,
        brand -> Nullable<Text>,
        model -> Nullable<Text>,
        unit -> Nullable<Text>,
        vat_rate -> Nullable<Text>,
        cn_code -> Nullable<Text>,
        pkwiu -> Nullable<Text>,
        gtu_code -> Nullable<Text>,
        ksef_procedure -> Nullable<Text>,
        purchase_price_net -> Nullable<Text>,
        sale_price_net -> Nullable<Text>,
        currency -> Nullable<Text>,
        min_stock -> Nullable<Text>,
        stock -> Nullable<Text>,
        is_service -> Integer,
        is_active -> Integer,
        location -> Nullable<Text>,
        weight_net -> Nullable<Text>,
        weight_gross -> Nullable<Text>,
        length -> Nullable<Text>,
        width -> Nullable<Text>,
        height -> Nullable<Text>,
        images -> Nullable<Text>,
        attributes -> Nullable<Text>,
        expiry_date -> Nullable<Text>,
        lot_number -> Nullable<Text>,
        country_of_origin -> Nullable<Text>,
        created_at -> Text,
        updated_at -> Nullable<Text>,
    }
}

diesel::table! {
    product_prices (id) {
        id -> Integer,
        product_id -> Integer,
        currency -> Text,
        price -> Text,
        valid_from -> Text,
        valid_to -> Nullable<Text>,
        created_at -> Text,
    }
}

diesel::joinable!(invoices -> companies (issuer_company_id));
diesel::joinable!(invoice_lines -> invoices (invoice_id));
diesel::joinable!(products -> companies (company_id));
diesel::joinable!(product_prices -> products (product_id));

diesel::allow_tables_to_appear_in_same_query!(
    companies,
    invoices,
    invoice_lines,
    products,
    product_prices,
);
