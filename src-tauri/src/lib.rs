pub mod db;
pub mod schema;
pub mod invoice;

use diesel::SqliteConnection;
use std::sync::OnceLock;
use tauri::Manager;

static DB_POOL: OnceLock<db::DbPool> = OnceLock::new();

async fn run_db_task<F, R>(task: F) -> Result<R, String>
where
    F: FnOnce(&mut SqliteConnection) -> Result<R, String> + Send + 'static,
    R: Send + 'static,
{
    let pool = DB_POOL.get().ok_or_else(|| "DB not initialised".to_string())?.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = pool.get().map_err(|e| format!("Failed to get connection: {}", e))?;
        task(&mut conn)
    })
    .await
    .map_err(|e| format!("Task panicked: {}", e))
    .and_then(|r| r)
}

#[tauri::command]
async fn cmd_has_companies() -> Result<bool, String> {
    run_db_task(|conn| db::has_companies(conn).map_err(|e| e.to_string())).await
}

#[derive(serde::Deserialize)]
struct CreateCompanyPayload {
    pub name: String,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    #[serde(alias = "postalCode", alias = "postCode", alias = "postal")]
    pub postal_code: Option<String>,
    pub country: Option<String>,
}

#[tauri::command]
async fn cmd_create_company(payload: CreateCompanyPayload) -> Result<db::Company, String> {
    run_db_task(move |conn| {
        let new_company = db::NewCompany {
            name: &payload.name,
            nip: payload.nip.as_deref(),
            street: payload.street.as_deref(),
            city: payload.city.as_deref(),
            postal_code: payload.postal_code.as_deref(),
            country: payload.country.as_deref(),
        };
        db::create_company(conn, new_company).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
async fn cmd_list_companies() -> Result<Vec<db::Company>, String> {
    run_db_task(|conn| db::list_companies(conn).map_err(|e| e.to_string())).await
}

#[tauri::command]
async fn cmd_get_company(id: i32) -> Result<db::Company, String> {
    run_db_task(move |conn| db::fetch_company_by_id(conn, id).map_err(|e| e.to_string())).await
}

#[derive(serde::Deserialize)]
struct UpdateCompanyPayload {
    pub id: i32,
    pub name: Option<String>,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub ksef_connected: Option<bool>,
    pub ksef_metadata: Option<String>,
}

#[tauri::command]
async fn cmd_update_company(payload: UpdateCompanyPayload) -> Result<db::Company, String> {
    run_db_task(move |conn| {
        let updates = db::UpdateCompany {
            name: payload.name,
            nip: Some(payload.nip),
            street: Some(payload.street),
            city: Some(payload.city),
            postal_code: Some(payload.postal_code),
            country: Some(payload.country),
            ksef_connected: payload.ksef_connected,
            ksef_metadata: Some(payload.ksef_metadata),
        };
        db::update_company(conn, payload.id, updates).map_err(|e| e.to_string())
    })
    .await
}

#[derive(serde::Deserialize)]
struct CreateInvoiceLinePayload {
    pub name: String,
    pub measure_unit: Option<String>,
    pub quantity: Option<String>,
    pub net_price: Option<String>,
    pub tax_rate: Option<String>,
    pub line_net_total: Option<String>,
    pub line_tax_total: Option<String>,
    pub line_gross_total: Option<String>,
}

#[derive(serde::Deserialize)]
struct CreateInvoicePayload {
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
    pub net_amount: Option<String>,
    pub tax_amount: Option<String>,
    pub gross_amount: Option<String>,
    pub lines: Vec<CreateInvoiceLinePayload>,
}

#[derive(serde::Deserialize)]
struct UpdateInvoiceNumberPayload {
    pub invoice_id: i32,
    pub issuer_company_id: i32,
    pub new_number: String,
}

#[tauri::command]
async fn cmd_create_invoice(payload: CreateInvoicePayload) -> Result<invoice::Invoice, String> {
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
            net_amount,
            tax_amount,
            gross_amount,
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
async fn cmd_get_invoice(id: i32) -> Result<(invoice::Invoice, Vec<invoice::InvoiceLine>), String> {
    run_db_task(move |conn| invoice::fetch_invoice_by_id(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
async fn cmd_list_invoices(limit: i64) -> Result<Vec<invoice::Invoice>, String> {
    run_db_task(move |conn| invoice::list_invoices(conn, limit).map_err(|e| e.to_string())).await
}

#[tauri::command]
async fn cmd_generate_invoice_xml(id: i32) -> Result<String, String> {
    run_db_task(move |conn| invoice::generate_fa3_xml(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
async fn cmd_update_invoice_number(payload: UpdateInvoiceNumberPayload) -> Result<invoice::Invoice, String> {
    run_db_task(move |conn| invoice::update_invoice_number(conn, payload.invoice_id, payload.issuer_company_id, &payload.new_number).map_err(|e| e.to_string())).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();

            let mut app_dir = app_handle
                .path()
                .app_local_data_dir()
                .unwrap_or_else(|_| std::env::temp_dir());

            if std::fs::create_dir_all(&app_dir).is_err() {
                let mut tmp = std::env::temp_dir();
                tmp.push("erp");
                let _ = std::fs::create_dir_all(&tmp);
                app_dir = tmp;
            }

            let db_path = app_dir.join("erp.sqlite3").to_string_lossy().to_string();

            if let Ok(pool) = db::init_db(&db_path) {
                let _ = DB_POOL.set(pool);
            } else {
                let mut tmp = std::env::temp_dir();
                tmp.push("erp");
                let _ = std::fs::create_dir_all(&tmp);
                let fallback_db_path = tmp.join("erp.sqlite3").to_string_lossy().to_string();
                if let Ok(pool) = db::init_db(&fallback_db_path) {
                    let _ = DB_POOL.set(pool);
                }
            }

            if std::env::var("ENABLE_DEVTOOLS").is_ok() {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            cmd_has_companies,
            cmd_create_company,
            cmd_list_companies,
            cmd_get_company,
            cmd_update_company,
            cmd_create_invoice,
            cmd_get_invoice,
            cmd_list_invoices,
            cmd_generate_invoice_xml,
            cmd_update_invoice_number
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
