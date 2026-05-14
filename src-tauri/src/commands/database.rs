use crate::run_db_task;
use diesel::connection::SimpleConnection;

#[tauri::command]
pub async fn cmd_import_database(sql: String) -> Result<(), String> {
    run_db_task(move |conn| {
        conn.batch_execute(&sql)
            .map_err(|e| format!("Failed to execute SQL: {}", e))
    })
    .await
}
