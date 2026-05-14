use crate::run_db_task;
use crate::warehouse_location::{self, WarehouseLocation};

#[tauri::command]
pub async fn cmd_get_warehouse_locations(warehouse_id: i32) -> Result<Vec<WarehouseLocation>, String> {
    run_db_task(move |conn| {
        warehouse_location::get_locations(conn, warehouse_id).map_err(|e| e.to_string())
    })
    .await
}
