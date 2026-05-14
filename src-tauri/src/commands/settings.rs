use crate::run_db_task;
use crate::settings;

#[tauri::command]
pub async fn cmd_get_setting(key: String) -> Result<Option<String>, String> {
    run_db_task(move |conn| settings::get_setting(conn, &key).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_set_setting(key: String, value: String) -> Result<(), String> {
    run_db_task(move |conn| settings::set_setting(conn, &key, &value).map_err(|e| e.to_string())).await
}
