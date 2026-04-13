use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::schema::warehouses;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, Selectable)]
#[diesel(table_name = warehouses)]
pub struct Warehouse {
    pub id: i32,
    pub company_id: i32,
    pub name: String,
    pub location_code_prefix: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = warehouses)]
pub struct NewWarehouse {
    pub company_id: i32,
    pub name: String,
    pub location_code_prefix: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = warehouses)]
pub struct UpdateWarehouse {
    pub name: Option<String>,
    pub location_code_prefix: Option<String>,
}

pub fn create_warehouse(
    conn: &mut SqliteConnection,
    new_warehouse: NewWarehouse,
) -> Result<Warehouse, diesel::result::Error> {
    diesel::insert_into(warehouses::table)
        .values(&new_warehouse)
        .get_result(conn)
}

pub fn get_warehouses(
    conn: &mut SqliteConnection,
    company_id: i32,
) -> Result<Vec<Warehouse>, diesel::result::Error> {
    warehouses::table
        .filter(warehouses::company_id.eq(company_id))
        .load::<Warehouse>(conn)
}

pub fn get_warehouse(
    conn: &mut SqliteConnection,
    warehouse_id: i32,
) -> Result<Warehouse, diesel::result::Error> {
    warehouses::table
        .find(warehouse_id)
        .first::<Warehouse>(conn)
}

pub fn update_warehouse(
    conn: &mut SqliteConnection,
    warehouse_id: i32,
    update_data: UpdateWarehouse,
) -> Result<Warehouse, diesel::result::Error> {
    diesel::update(warehouses::table.find(warehouse_id))
        .set(&update_data)
        .get_result(conn)
}

pub fn delete_warehouse(
    conn: &mut SqliteConnection,
    warehouse_id: i32,
) -> Result<usize, diesel::result::Error> {
    diesel::delete(warehouses::table.find(warehouse_id)).execute(conn)
}
