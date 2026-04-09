use anyhow::{anyhow, Context, Result};
use diesel::prelude::*;
use diesel::SqliteConnection;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::schema::{invoice_lines, invoices};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = invoices)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Invoice {
    pub id: i32,
    pub issuer_company_id: i32,
    pub seller_company_id: Option<i32>,
    pub buyer_company_id: Option<i32>,
    pub invoice_number: String,
    pub invoice_type: String,
    pub issue_date: String,
    pub sale_date: Option<String>,
    pub due_date: Option<String>,
    pub currency: String,
    pub seller_name: String,
    pub seller_nip: Option<String>,
    pub seller_country: Option<String>,
    pub seller_street: Option<String>,
    pub seller_building_number: Option<String>,
    pub seller_flat_number: Option<String>,
    pub seller_city: Option<String>,
    pub seller_postal_code: Option<String>,
    pub buyer_name: String,
    pub buyer_nip: Option<String>,
    pub buyer_country: Option<String>,
    pub buyer_street: Option<String>,
    pub buyer_building_number: Option<String>,
    pub buyer_flat_number: Option<String>,
    pub buyer_city: Option<String>,
    pub buyer_postal_code: Option<String>,
    pub net_amount: Option<String>,
    pub tax_amount: Option<String>,
    pub gross_amount: Option<String>,
    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = invoices)]
pub struct NewInvoice {
    pub issuer_company_id: i32,
    pub seller_company_id: Option<i32>,
    pub buyer_company_id: Option<i32>,
    pub invoice_number: String,
    pub invoice_type: String,
    pub issue_date: String,
    pub sale_date: Option<String>,
    pub due_date: Option<String>,
    pub currency: String,
    pub seller_name: String,
    pub seller_nip: Option<String>,
    pub seller_country: Option<String>,
    pub seller_street: Option<String>,
    pub seller_building_number: Option<String>,
    pub seller_flat_number: Option<String>,
    pub seller_city: Option<String>,
    pub seller_postal_code: Option<String>,
    pub buyer_name: String,
    pub buyer_nip: Option<String>,
    pub buyer_country: Option<String>,
    pub buyer_street: Option<String>,
    pub buyer_building_number: Option<String>,
    pub buyer_flat_number: Option<String>,
    pub buyer_city: Option<String>,
    pub buyer_postal_code: Option<String>,
    pub net_amount: Option<String>,
    pub tax_amount: Option<String>,
    pub gross_amount: Option<String>,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = invoices)]
pub struct UpdateInvoice {
    pub invoice_number: Option<String>,
    pub issue_date: Option<String>,
    pub sale_date: Option<Option<String>>,
    pub due_date: Option<Option<String>>,
    pub currency: Option<String>,
    pub seller_name: Option<String>,
    pub seller_nip: Option<Option<String>>,
    pub seller_country: Option<Option<String>>,
    pub seller_street: Option<Option<String>>,
    pub seller_building_number: Option<Option<String>>,
    pub seller_flat_number: Option<Option<String>>,
    pub seller_city: Option<Option<String>>,
    pub seller_postal_code: Option<Option<String>>,
    pub buyer_name: Option<String>,
    pub buyer_nip: Option<Option<String>>,
    pub buyer_country: Option<Option<String>>,
    pub buyer_street: Option<Option<String>>,
    pub buyer_building_number: Option<Option<String>>,
    pub buyer_flat_number: Option<Option<String>>,
    pub buyer_city: Option<Option<String>>,
    pub buyer_postal_code: Option<Option<String>>,
    pub net_amount: Option<Option<String>>,
    pub tax_amount: Option<Option<String>>,
    pub gross_amount: Option<Option<String>>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = invoice_lines)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct InvoiceLine {
    pub id: i32,
    pub invoice_id: i32,
    pub position: i32,
    pub name: String,
    pub measure_unit: Option<String>,
    pub quantity: Option<String>,
    pub net_price: Option<String>,
    pub tax_rate: Option<String>,
    pub line_net_total: Option<String>,
    pub line_tax_total: Option<String>,
    pub line_gross_total: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = invoice_lines)]
pub struct NewInvoiceLine {
    pub invoice_id: i32,
    pub position: i32,
    pub name: String,
    pub measure_unit: Option<String>,
    pub quantity: Option<String>,
    pub net_price: Option<String>,
    pub tax_rate: Option<String>,
    pub line_net_total: Option<String>,
    pub line_tax_total: Option<String>,
    pub line_gross_total: Option<String>,
}

pub fn create_invoice(
    conn: &mut SqliteConnection,
    new_invoice: NewInvoice,
    new_lines: Vec<NewInvoiceLine>,
) -> Result<Invoice> {
    conn.transaction::<Invoice, anyhow::Error, _>(|conn| {
        let inserted: Invoice = diesel::insert_into(invoices::table)
            .values(&new_invoice)
            .returning(Invoice::as_returning())
            .get_result(conn)
            .context("Failed to insert invoice")?;

        let mut to_insert: Vec<NewInvoiceLine> = Vec::with_capacity(new_lines.len());
        for ln in new_lines.into_iter() {
            let l = NewInvoiceLine {
                invoice_id: inserted.id,
                position: ln.position,
                name: ln.name,
                measure_unit: ln.measure_unit,
                quantity: ln.quantity,
                net_price: ln.net_price,
                tax_rate: ln.tax_rate,
                line_net_total: ln.line_net_total,
                line_tax_total: ln.line_tax_total,
                line_gross_total: ln.line_gross_total,
            };
            to_insert.push(l);
        }

        if !to_insert.is_empty() {
            diesel::insert_into(invoice_lines::table)
                .values(&to_insert)
                .execute(conn)
                .context("Failed to insert invoice lines")?;
        }

        Ok(inserted)
    })
    .map_err(|e| anyhow!(e.to_string()))
}

pub fn fetch_invoice_by_id(conn: &mut SqliteConnection, invoice_id: i32) -> Result<(Invoice, Vec<InvoiceLine>)> {
    use crate::schema::invoice_lines::dsl as lines_dsl;
    use crate::schema::invoices::dsl as inv_dsl;

    let inv: Invoice = inv_dsl::invoices
        .find(invoice_id)
        .first(conn)
        .with_context(|| format!("Failed to fetch invoice id={}", invoice_id))?;

    let lines: Vec<InvoiceLine> = lines_dsl::invoice_lines
        .filter(lines_dsl::invoice_id.eq(invoice_id))
        .order(lines_dsl::position.asc())
        .load(conn)
        .context("Failed to load invoice lines")?;

    Ok((inv, lines))
}

pub fn list_invoices(conn: &mut SqliteConnection, limit: i64) -> Result<Vec<Invoice>> {
    use crate::schema::invoices::dsl::*;

    let mut q = invoices.into_boxed();
    q = q.order((created_at.desc(), id.desc()));
    if limit > 0 {
        q = q.limit(limit);
    }

    q.load(conn)
        .context("Failed to list invoices")
}

pub fn update_invoice_number(
    conn: &mut SqliteConnection,
    invoice_id_val: i32,
    issuer_company_id_val: i32,
    new_number: &str,
) -> Result<Invoice> {
    use crate::schema::invoices::dsl::*;

    let conflict: Option<i32> = invoices
        .filter(issuer_company_id.eq(issuer_company_id_val))
        .filter(invoice_number.eq(new_number))
        .select(id)
        .first(conn)
        .optional()
        .context("Failed to check existing invoice number")?;

    if let Some(found_id) = conflict {
        if found_id != invoice_id_val {
            return Err(anyhow!("Invoice number '{}' is already used by this issuer", new_number));
        }
    }

    let updated: Invoice = diesel::update(invoices.find(invoice_id_val))
        .set(invoice_number.eq(new_number))
        .returning(Invoice::as_returning())
        .get_result(conn)
        .with_context(|| format!("Failed to update invoice id={}", invoice_id_val))?;

    Ok(updated)
}

pub fn generate_fa3_xml(conn: &mut SqliteConnection, invoice_id: i32) -> Result<String> {
    let (inv, lines) = fetch_invoice_by_id(conn, invoice_id)?;

    use invoice_gen::fa_3::builder::{BuyerBuilder, LineBuilder, SellerBuilder};
    use invoice_gen::shared::models::CurrencyCode;
    use invoice_gen::shared::models::TaxRate;
    use invoice_gen::fa_3::models::Invoice as Fa3Invoice;

    let seller_nip = inv.seller_nip.clone().unwrap_or_default();
    let mut seller_builder = SellerBuilder::new(&seller_nip, &inv.seller_name);
    if let (Some(country), Some(street), Some(building), Some(city), Some(postal)) = (
        inv.seller_country.as_deref(),
        inv.seller_street.as_deref(),
        inv.seller_building_number.as_deref(),
        inv.seller_city.as_deref(),
        inv.seller_postal_code.as_deref(),
    ) {
        let flat_opt = inv.seller_flat_number.as_deref();
        seller_builder = seller_builder.set_address(country, street, building, flat_opt, city, postal);
    }
    let seller = seller_builder.build();

    let buyer_nip = inv.buyer_nip.clone().unwrap_or_default();
    let mut buyer_builder = BuyerBuilder::new(&buyer_nip, &inv.buyer_name);
    if let (Some(country), Some(street), Some(building), Some(city), Some(postal)) = (
        inv.buyer_country.as_deref(),
        inv.buyer_street.as_deref(),
        inv.buyer_building_number.as_deref(),
        inv.buyer_city.as_deref(),
        inv.buyer_postal_code.as_deref(),
    ) {
        let flat_opt = inv.buyer_flat_number.as_deref();
        buyer_builder = buyer_builder.set_address(country, street, building, flat_opt, city, postal);
    }
    let buyer = buyer_builder.build();

    let mut fa_lines = Vec::with_capacity(lines.len());
    for ln in lines.iter() {
        let quantity_dec = ln
            .quantity
            .as_deref()
            .and_then(|s| Decimal::from_str(s).ok())
            .unwrap_or_else(|| Decimal::new(1, 0));
        let net_price_dec = ln
            .net_price
            .as_deref()
            .and_then(|s| Decimal::from_str(s).ok())
            .unwrap_or_else(|| Decimal::new(0, 2));
        let tax_rate_str = ln.tax_rate.as_deref().unwrap_or("23");

        let tax_rate = match TaxRate::from_str(tax_rate_str) {
            Ok(t) => t,
            Err(_) => return Err(anyhow!("Invalid tax rate: {}", tax_rate_str)),
        };

        let line = LineBuilder::new(&ln.name, quantity_dec, net_price_dec, tax_rate).build();

        fa_lines.push(line);
    }

    let mut fa3 = Fa3Invoice::default();
    fa3.subject1 = seller;
    fa3.subject2 = buyer;
    fa3.invoice_body.invoice_number = inv.invoice_number.clone();
    fa3.invoice_body.issue_date = inv.issue_date.clone();
    fa3.invoice_body.currency_code = CurrencyCode::new(&inv.currency);
    fa3.invoice_body.lines = fa_lines;

    let xml = fa3.to_xml().map_err(|e| anyhow!("Failed to generate XML: {}", e))?;
    Ok(xml)
}
