use crate::schema::{warehouse_documents, warehouse_document_lines};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = warehouse_documents)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WarehouseDocument {
    pub id: i32,
    pub document_number: String,
    pub document_type: String,
    pub issue_date: String,
    pub status: String,
    pub related_invoice_id: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = warehouse_documents)]
pub struct NewWarehouseDocument {
    pub document_number: String,
    pub document_type: String,
    pub issue_date: String,
    pub status: String,
    pub related_invoice_id: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = warehouse_document_lines)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WarehouseDocumentLine {
    pub id: i32,
    pub warehouse_document_id: i32,
    pub product_id: Option<i32>,
    pub quantity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = warehouse_document_lines)]
pub struct NewWarehouseDocumentLine {
    pub warehouse_document_id: i32,
    pub product_id: Option<i32>,
    pub quantity: String,
}
