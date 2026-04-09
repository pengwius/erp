use crate::invoice;
use crate::run_db_task;

#[derive(serde::Deserialize)]
pub struct CreateInvoiceLinePayload {
    pub name: String,
    pub measure_unit: Option<String>,
    pub quantity: Option<String>,
    pub net_price: Option<String>,
    pub tax_rate: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct CreateInvoicePayload {
    pub issuer_company_id: i32,
    pub seller_company_id: Option<i32>,
    pub buyer_company_id: Option<i32>,
    pub invoice_number: String,
    pub invoice_type: String,
    pub issue_date: String,
    pub sale_date: Option<String>,
    pub due_date: Option<String>,
    pub currency: String,
    pub seller_name: String,
    pub seller_nip: Option<String>,
    pub seller_country: Option<String>,
    pub seller_street: Option<String>,
    pub seller_building_number: Option<String>,
    pub seller_flat_number: Option<String>,
    pub seller_city: Option<String>,
    pub seller_postal_code: Option<String>,
    pub buyer_name: String,
    pub buyer_nip: Option<String>,
    pub buyer_country: Option<String>,
    pub buyer_street: Option<String>,
    pub buyer_building_number: Option<String>,
    pub buyer_flat_number: Option<String>,
    pub buyer_city: Option<String>,
    pub buyer_postal_code: Option<String>,
    pub lines: Vec<CreateInvoiceLinePayload>,
}

#[derive(serde::Deserialize)]
pub struct UpdateInvoiceNumberPayload {
    pub invoice_id: i32,
    pub issuer_company_id: i32,
    pub new_number: String,
}

#[tauri::command]
pub async fn cmd_create_invoice(payload: CreateInvoicePayload) -> Result<invoice::Invoice, String> {
    use std::str::FromStr;
    run_db_task(move |conn| {
        let CreateInvoicePayload {
            issuer_company_id,
            seller_company_id,
            buyer_company_id,
            invoice_number,
            invoice_type,
            issue_date,
            sale_date,
            due_date,
            currency,
            seller_name,
            seller_nip,
            seller_country,
            seller_street,
            seller_building_number,
            seller_flat_number,
            seller_city,
            seller_postal_code,
            buyer_name,
            buyer_nip,
            buyer_country,
            buyer_street,
            buyer_building_number,
            buyer_flat_number,
            buyer_city,
            buyer_postal_code,
            lines,
        } = payload;

        let mut owned_lines: Vec<invoice::NewInvoiceLine> = Vec::with_capacity(lines.len());
        let mut total_net = rust_decimal::Decimal::new(0, 2);
        let mut total_tax = rust_decimal::Decimal::new(0, 2);
        let mut total_gross = rust_decimal::Decimal::new(0, 2);

        for (i, l) in lines.into_iter().enumerate() {
            let name = l.name;
            let measure_unit = l.measure_unit;
            let quantity_s = l.quantity.unwrap_or_else(|| "1".to_string());
            let net_price_s = l.net_price.unwrap_or_else(|| "0".to_string());
            let tax_rate_s = l.tax_rate.unwrap_or_else(|| "23".to_string());

            let qty = rust_decimal::Decimal::from_str(&quantity_s).unwrap_or(rust_decimal::Decimal::new(1, 0));
            let net_p = rust_decimal::Decimal::from_str(&net_price_s).unwrap_or(rust_decimal::Decimal::new(0, 2));
            let line_net = (qty * net_p).round_dp(2);
            let tax_pct = rust_decimal::Decimal::from_str(&tax_rate_s).unwrap_or(rust_decimal::Decimal::new(23, 0));
            let line_tax = (line_net * tax_pct / rust_decimal::Decimal::new(100, 0)).round_dp(2);
            let line_gross = (line_net + line_tax).round_dp(2);

            total_net += line_net;
            total_tax += line_tax;
            total_gross += line_gross;

            owned_lines.push(invoice::NewInvoiceLine {
                invoice_id: 0,
                position: (i as i32) + 1,
                name,
                measure_unit,
                quantity: Some(quantity_s),
                net_price: Some(net_price_s),
                tax_rate: Some(tax_rate_s),
                line_net_total: Some(line_net.to_string()),
                line_tax_total: Some(line_tax.to_string()),
                line_gross_total: Some(line_gross.to_string()),
            });
        }

        let new_inv = invoice::NewInvoice {
            issuer_company_id,
            seller_company_id,
            buyer_company_id,
            invoice_number,
            invoice_type,
            issue_date,
            sale_date,
            due_date,
            currency,
            seller_name,
            seller_nip,
            seller_country,
            seller_street,
            seller_building_number,
            seller_flat_number,
            seller_city,
            seller_postal_code,
            buyer_name,
            buyer_nip,
            buyer_country,
            buyer_street,
            buyer_building_number,
            buyer_flat_number,
            buyer_city,
            buyer_postal_code,
            net_amount: Some(total_net.round_dp(2).to_string()),
            tax_amount: Some(total_tax.round_dp(2).to_string()),
            gross_amount: Some(total_gross.round_dp(2).to_string()),
        };

        invoice::create_invoice(conn, new_inv, owned_lines).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_invoice(id: i32) -> Result<(invoice::Invoice, Vec<invoice::InvoiceLine>), String> {
    run_db_task(move |conn| invoice::fetch_invoice_by_id(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_list_invoices(limit: i64) -> Result<Vec<invoice::Invoice>, String> {
    run_db_task(move |conn| invoice::list_invoices(conn, limit).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_generate_invoice_xml(id: i32) -> Result<String, String> {
    run_db_task(move |conn| invoice::generate_fa3_xml(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_update_invoice_number(payload: UpdateInvoiceNumberPayload) -> Result<invoice::Invoice, String> {
    run_db_task(move |conn| invoice::update_invoice_number(conn, payload.invoice_id, payload.issuer_company_id, &payload.new_number).map_err(|e| e.to_string())).await
}


