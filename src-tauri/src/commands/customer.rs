use crate::customer::{
    create_customer, delete_customer, get_customer, list_customers, update_customer, Customer,
    NewCustomer, UpdateCustomer,
};
use crate::run_db_task;

#[tauri::command]
pub async fn cmd_create_customer(new_customer: NewCustomer) -> Result<Customer, String> {
    run_db_task(move |conn| create_customer(conn, new_customer).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_update_customer(id: i32, changes: UpdateCustomer) -> Result<Customer, String> {
    run_db_task(move |conn| update_customer(conn, id, changes).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_delete_customer(id: i32) -> Result<usize, String> {
    run_db_task(move |conn| delete_customer(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_get_customer(id: i32) -> Result<Customer, String> {
    run_db_task(move |conn| get_customer(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_list_customers(company_id: i32) -> Result<Vec<Customer>, String> {
    run_db_task(move |conn| list_customers(conn, company_id).map_err(|e| e.to_string())).await
}
