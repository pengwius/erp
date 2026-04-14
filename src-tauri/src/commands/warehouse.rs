use crate::warehouse::{
    create_warehouse, delete_warehouse, get_warehouse, get_warehouses, update_warehouse,
    NewWarehouse, UpdateWarehouse, Warehouse,
};
use crate::run_db_task;

#[tauri::command]
pub async fn cmd_create_warehouse(new_warehouse: NewWarehouse) -> Result<Warehouse, String> {
    run_db_task(move |conn| create_warehouse(conn, new_warehouse).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_get_warehouses(company_id: i32) -> Result<Vec<Warehouse>, String> {
    run_db_task(move |conn| get_warehouses(conn, company_id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_get_warehouse(id: i32) -> Result<Warehouse, String> {
    run_db_task(move |conn| get_warehouse(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_update_warehouse(id: i32, update_data: UpdateWarehouse) -> Result<Warehouse, String> {
    run_db_task(move |conn| update_warehouse(conn, id, update_data).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_delete_warehouse(id: i32) -> Result<usize, String> {
    run_db_task(move |conn| delete_warehouse(conn, id).map_err(|e| e.to_string())).await
}
