use crate::schema::warehouse_locations;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable, Identifiable)]
#[diesel(table_name = warehouse_locations)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WarehouseLocation {
    pub id: i32,
    pub warehouse_id: i32,
    pub zone: Option<String>,
    pub rack: Option<String>,
    pub shelf: Option<String>,
    pub bin: Option<String>,
    pub barcode: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = warehouse_locations)]
pub struct NewWarehouseLocation {
    pub warehouse_id: i32,
    pub zone: Option<String>,
    pub rack: Option<String>,
    pub shelf: Option<String>,
    pub bin: Option<String>,
    pub barcode: Option<String>,
}

pub fn get_locations(
    conn: &mut SqliteConnection,
    warehouse_id_val: i32,
) -> QueryResult<Vec<WarehouseLocation>> {
    warehouse_locations::table
        .filter(warehouse_locations::warehouse_id.eq(warehouse_id_val))
        .load::<WarehouseLocation>(conn)
}
