pub mod commands;
pub mod db;
pub mod schema;
pub mod invoice;
pub mod product;
pub mod customer;
pub mod warehouse;

use diesel::SqliteConnection;
use diesel::RunQueryDsl;
use std::sync::OnceLock;
use tauri::Manager;
use std::path::PathBuf;

static DB_POOL: OnceLock<db::DbPool> = OnceLock::new();
static APP_DIR: OnceLock<PathBuf> = OnceLock::new();

pub async fn run_db_task<F, R>(task: F) -> Result<R, String>
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

// #[tauri::command]
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

// #[tauri::command]
async fn cmd_get_invoice(id: i32) -> Result<(invoice::Invoice, Vec<invoice::InvoiceLine>), String> {
    run_db_task(move |conn| invoice::fetch_invoice_by_id(conn, id).map_err(|e| e.to_string())).await
}

// #[tauri::command]
async fn cmd_list_invoices(limit: i64) -> Result<Vec<invoice::Invoice>, String> {
    run_db_task(move |conn| invoice::list_invoices(conn, limit).map_err(|e| e.to_string())).await
}

// #[tauri::command]
async fn cmd_generate_invoice_xml(id: i32) -> Result<String, String> {
    run_db_task(move |conn| invoice::generate_fa3_xml(conn, id).map_err(|e| e.to_string())).await
}

// #[tauri::command]
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

            let _ = APP_DIR.set(app_dir.clone());

            let db_path = app_dir.join("erp.sqlite3").to_string_lossy().to_string();

            match db::init_db(&db_path) {
                Ok(pool) => {
                    let _ = DB_POOL.set(pool.clone());


                }
                Err(e) => {
                    eprintln!("Failed to init DB at {}: {:?}", db_path, e);
                    let mut tmp = std::env::temp_dir();
                    tmp.push("erp");
                    let _ = std::fs::create_dir_all(&tmp);
                    let fallback_db_path = tmp.join("erp.sqlite3").to_string_lossy().to_string();
                    match db::init_db(&fallback_db_path) {
                        Ok(pool) => {
                            let _ = DB_POOL.set(pool.clone());


                        }
                        Err(e2) => {
                            eprintln!("Failed to init fallback DB at {}: {:?}", fallback_db_path, e2);
                        }
                    }
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
            commands::company::cmd_has_companies,
            commands::company::cmd_create_company,
            commands::company::cmd_list_companies,
            commands::company::cmd_get_company,
            commands::company::cmd_update_company,
            commands::invoice::cmd_create_invoice,
            commands::invoice::cmd_get_invoice,
            commands::invoice::cmd_list_invoices,
            commands::invoice::cmd_generate_invoice_xml,
            commands::invoice::cmd_update_invoice_number,
            commands::product::cmd_create_product,
            commands::product::cmd_get_image,
            commands::product::cmd_update_product,
            commands::product::cmd_delete_product,
            commands::product::cmd_delete_product_price,
            commands::product::cmd_list_products,
            commands::product::cmd_get_product,
            commands::product::cmd_create_product_price,
            commands::product::cmd_list_product_prices,
            commands::product::cmd_get_current_price,
            commands::customer::cmd_create_customer,
            commands::customer::cmd_update_customer,
            commands::customer::cmd_delete_customer,
            commands::customer::cmd_get_customer,
            commands::customer::cmd_list_customers,
            commands::warehouse::cmd_create_warehouse,
            commands::warehouse::cmd_get_warehouses,
            commands::warehouse::cmd_get_warehouse,
            commands::warehouse::cmd_update_warehouse,
            commands::warehouse::cmd_delete_warehouse,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
