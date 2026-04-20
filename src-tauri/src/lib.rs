pub mod commands;
pub mod customer;
pub mod db;
pub mod invoice;
pub mod product;
pub mod schema;
pub mod stock;
pub mod warehouse;

use diesel::SqliteConnection;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::Manager;

static DB_POOL: OnceLock<db::DbPool> = OnceLock::new();
static APP_DIR: OnceLock<PathBuf> = OnceLock::new();

pub async fn run_db_task<F, R>(task: F) -> Result<R, String>
where
    F: FnOnce(&mut SqliteConnection) -> Result<R, String> + Send + 'static,
    R: Send + 'static,
{
    let pool = DB_POOL
        .get()
        .ok_or_else(|| "DB not initialised".to_string())?
        .clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = pool
            .get()
            .map_err(|e| format!("Failed to get connection: {}", e))?;
        task(&mut conn)
    })
    .await
    .map_err(|e| format!("Task panicked: {}", e))
    .and_then(|r| r)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub mod settings;
pub mod warehouse_document;
pub mod warehouse_location;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
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
                            eprintln!(
                                "Failed to init fallback DB at {}: {:?}",
                                fallback_db_path, e2
                            );
                        }
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::settings::cmd_get_setting,
            commands::settings::cmd_set_setting,
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
            commands::stock::cmd_create_stock_document,
            commands::stock::cmd_get_stocks,
            commands::stock::cmd_get_stock_documents,
            commands::warehouse_location::cmd_get_warehouse_locations,
            commands::database::cmd_import_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
