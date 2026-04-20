use diesel::prelude::*;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::schema::{products, stock_document_lines, stock_documents, stocks};

#[derive(Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = stocks)]
pub struct Stock {
    pub id: i32,
    pub product_id: i32,
    pub warehouse_id: i32,
    pub location_code: Option<String>,
    pub physical_quantity: String,
    pub reserved_quantity: String,
    pub available_quantity: String,
    pub location_id: Option<i32>,
}

#[derive(Insertable, Debug, Clone)]
#[diesel(table_name = stocks)]
pub struct NewStock {
    pub product_id: i32,
    pub warehouse_id: i32,
    pub location_code: Option<String>,
    pub physical_quantity: String,
    pub reserved_quantity: String,
    pub available_quantity: String,
    pub location_id: Option<i32>,
}

#[derive(AsChangeset, Debug, Clone)]
#[diesel(table_name = stocks)]
pub struct UpdateStock {
    pub physical_quantity: String,
    pub available_quantity: String,
}

#[derive(Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = stock_documents)]
pub struct StockDocument {
    pub id: i32,
    pub company_id: i32,
    pub document_type: String,
    pub document_number: String,
    pub source_warehouse_id: Option<i32>,
    pub target_warehouse_id: Option<i32>,
    pub issue_date: String,
    pub created_at: String,
}

#[derive(Insertable, Debug, Clone)]
#[diesel(table_name = stock_documents)]
pub struct NewStockDocument {
    pub company_id: i32,
    pub document_type: String,
    pub document_number: String,
    pub source_warehouse_id: Option<i32>,
    pub target_warehouse_id: Option<i32>,
    pub issue_date: String,
    pub created_at: String,
}

#[derive(Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = stock_document_lines)]
pub struct StockDocumentLine {
    pub id: i32,
    pub document_id: i32,
    pub product_id: i32,
    pub quantity: String,
    pub purchase_price: Option<String>,
}

#[derive(Insertable, Debug, Clone)]
#[diesel(table_name = stock_document_lines)]
pub struct NewStockDocumentLine {
    pub document_id: i32,
    pub product_id: i32,
    pub quantity: String,
    pub purchase_price: Option<String>,
}

pub fn create_stock_document(
    conn: &mut SqliteConnection,
    new_doc: NewStockDocument,
    lines: Vec<NewStockDocumentLine>,
) -> QueryResult<(StockDocument, Vec<StockDocumentLine>)> {
    conn.transaction(|conn| {
        diesel::insert_into(stock_documents::table)
            .values(&new_doc)
            .execute(conn)?;

        let inserted_doc = stock_documents::table
            .order(stock_documents::id.desc())
            .first::<StockDocument>(conn)?;

        let mut inserted_lines = Vec::new();
        for mut line in lines {
            line.document_id = inserted_doc.id;
            diesel::insert_into(stock_document_lines::table)
                .values(&line)
                .execute(conn)?;

            let inserted_line = stock_document_lines::table
                .order(stock_document_lines::id.desc())
                .first::<StockDocumentLine>(conn)?;
            inserted_lines.push(inserted_line.clone());

            let qty = Decimal::from_str(&line.quantity).unwrap_or(Decimal::ZERO);

            match new_doc.document_type.as_str() {
                "PZ" => {
                    if let Some(target_wh) = new_doc.target_warehouse_id {
                        update_or_insert_stock(conn, line.product_id, target_wh, None, qty)?;
                    }
                }
                "WZ" => {
                    if let Some(source_wh) = new_doc.source_warehouse_id {
                        update_or_insert_stock(conn, line.product_id, source_wh, None, -qty)?;
                    }
                }
                "MM" => {
                    if let Some(source_wh) = new_doc.source_warehouse_id {
                        update_or_insert_stock(conn, line.product_id, source_wh, None, -qty)?;
                    }
                    if let Some(target_wh) = new_doc.target_warehouse_id {
                        update_or_insert_stock(conn, line.product_id, target_wh, None, qty)?;
                    }
                }
                _ => {}
            }
        }

        Ok((inserted_doc, inserted_lines))
    })
}

pub fn update_or_insert_stock(
    conn: &mut SqliteConnection,
    product_id_val: i32,
    warehouse_id_val: i32,
    location_id_val: Option<i32>,
    qty_diff: Decimal,
) -> QueryResult<()> {
    let mut query = stocks::table
        .filter(stocks::product_id.eq(product_id_val))
        .filter(stocks::warehouse_id.eq(warehouse_id_val))
        .into_boxed();

    if let Some(loc_id) = location_id_val {
        query = query.filter(stocks::location_id.eq(loc_id));
    } else {
        query = query.filter(stocks::location_id.is_null());
    }

    let existing_stock = query.first::<Stock>(conn).optional()?;

    if let Some(stock) = existing_stock {
        let phys_qty = Decimal::from_str(&stock.physical_quantity).unwrap_or(Decimal::ZERO);
        let avail_qty = Decimal::from_str(&stock.available_quantity).unwrap_or(Decimal::ZERO);

        let new_phys = phys_qty + qty_diff;
        let new_avail = avail_qty + qty_diff;

        let update_data = UpdateStock {
            physical_quantity: new_phys.to_string(),
            available_quantity: new_avail.to_string(),
        };

        diesel::update(stocks::table.find(stock.id))
            .set(&update_data)
            .execute(conn)?;
    } else {
        let new_stock = NewStock {
            product_id: product_id_val,
            warehouse_id: warehouse_id_val,
            location_code: None,
            physical_quantity: qty_diff.to_string(),
            reserved_quantity: "0".to_string(),
            available_quantity: qty_diff.to_string(),
            location_id: location_id_val,
        };

        diesel::insert_into(stocks::table)
            .values(&new_stock)
            .execute(conn)?;
    }

    Ok(())
}

pub fn get_stocks(
    conn: &mut SqliteConnection,
    company_id_val: i32,
    warehouse_id_val: i32,
) -> QueryResult<Vec<Stock>> {
    stocks::table
        .inner_join(products::table)
        .filter(products::company_id.eq(company_id_val))
        .filter(stocks::warehouse_id.eq(warehouse_id_val))
        .select(stocks::all_columns)
        .load::<Stock>(conn)
}

pub fn get_stock_documents(
    conn: &mut SqliteConnection,
    company_id_val: i32,
) -> QueryResult<Vec<StockDocument>> {
    stock_documents::table
        .filter(stock_documents::company_id.eq(company_id_val))
        .order(stock_documents::created_at.desc())
        .load::<StockDocument>(conn)
}
