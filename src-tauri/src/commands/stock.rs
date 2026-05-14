use crate::run_db_task;
use crate::stock::{
    self, NewStockDocument, NewStockDocumentLine, Stock, StockDocument, StockDocumentLine,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateStockDocumentLinePayload {
    pub product_id: i32,
    pub quantity: String,
    pub purchase_price: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateStockDocumentPayload {
    pub company_id: i32,
    pub document_type: String,
    pub document_number: String,
    pub source_warehouse_id: Option<i32>,
    pub target_warehouse_id: Option<i32>,
    pub issue_date: String,
    pub created_at: Option<String>,
    pub lines: Vec<CreateStockDocumentLinePayload>,
}

#[tauri::command]
pub async fn cmd_create_stock_document(
    payload: CreateStockDocumentPayload,
) -> Result<(StockDocument, Vec<StockDocumentLine>), String> {
    run_db_task(move |conn| {
        let created_at = payload
            .created_at
            .unwrap_or_else(|| chrono::Utc::now().to_rfc3339());

        let new_doc = NewStockDocument {
            company_id: payload.company_id,
            document_type: payload.document_type,
            document_number: payload.document_number,
            source_warehouse_id: payload.source_warehouse_id,
            target_warehouse_id: payload.target_warehouse_id,
            issue_date: payload.issue_date,
            created_at,
        };

        let lines = payload
            .lines
            .into_iter()
            .map(|l| NewStockDocumentLine {
                document_id: 0,
                product_id: l.product_id,
                quantity: l.quantity,
                purchase_price: l.purchase_price,
            })
            .collect();

        stock::create_stock_document(conn, new_doc, lines).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_stocks(company_id: i32, warehouse_id: i32) -> Result<Vec<Stock>, String> {
    run_db_task(move |conn| {
        stock::get_stocks(conn, company_id, warehouse_id).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_stock_documents(company_id: i32) -> Result<Vec<StockDocument>, String> {
    run_db_task(move |conn| stock::get_stock_documents(conn, company_id).map_err(|e| e.to_string()))
        .await
}
