pub mod db;
pub mod schema;

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
            cmd_update_company
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
