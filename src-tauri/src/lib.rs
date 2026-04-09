pub mod commands;
pub mod db;
pub mod schema;
pub mod invoice;
pub mod product;

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

                    if let Ok(mut conn) = pool.get() {
                        match diesel::sql_query("ALTER TABLE products ADD COLUMN ean TEXT;").execute(&mut *conn) {
                            Ok(_) => {}
                            Err(err) => {
                                let s = err.to_string();
                                if !s.contains("duplicate column name") && !s.contains("already exists") {
                                    eprintln!("schema patch (add ean) failed: {}", s);
                                }
                            }
                        }
                    }
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

                            if let Ok(mut conn) = pool.get() {
                                match diesel::sql_query("ALTER TABLE products ADD COLUMN ean TEXT;").execute(&mut *conn) {
                                    Ok(_) => {}
                                    Err(err) => {
                                        let s = err.to_string();
                                        if !s.contains("duplicate column name") && !s.contains("already exists") {
                                            eprintln!("schema patch (add ean) failed on fallback DB: {}", s);
                                        }
                                    }
                                }
                            }
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
            commands::product::cmd_update_product,
            commands::product::cmd_delete_product,
            commands::product::cmd_list_products,
            commands::product::cmd_get_product,
            commands::product::cmd_create_product_price,
            commands::product::cmd_list_product_prices,
            commands::product::cmd_get_current_price,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
