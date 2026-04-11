use anyhow::{Context, Result};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

use crate::schema::{product_prices, products};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = products)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Product {
    pub id: i32,
    pub company_id: i32,
    pub sku: Option<String>,
    pub ean: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub category: Option<String>,
    pub brand: Option<String>,
    pub model: Option<String>,

    pub unit: Option<String>,
    pub vat_rate: Option<String>,
    pub cn_code: Option<String>,
    pub pkwiu: Option<String>,
    pub gtu_code: Option<String>,
    pub ksef_procedure: Option<String>,

    pub purchase_price_net: Option<String>,
    pub sale_price_net: Option<String>,
    pub currency: Option<String>,

    pub min_stock: Option<String>,
    pub stock: Option<String>,
    pub is_service: i32,
    pub is_active: i32,
    pub location: Option<String>,
    pub weight_net: Option<String>,
    pub weight_gross: Option<String>,
    pub length: Option<String>,
    pub width: Option<String>,
    pub height: Option<String>,

    pub images: Option<String>,
    pub attributes: Option<String>,

    pub expiry_date: Option<String>,
    pub lot_number: Option<String>,
    pub country_of_origin: Option<String>,

    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = products)]
pub struct NewProduct {
    pub company_id: i32,
    pub sku: Option<String>,
    pub ean: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub category: Option<String>,
    pub brand: Option<String>,
    pub model: Option<String>,

    pub unit: Option<String>,
    pub vat_rate: Option<String>,
    pub cn_code: Option<String>,
    pub pkwiu: Option<String>,
    pub gtu_code: Option<String>,
    pub ksef_procedure: Option<String>,

    pub purchase_price_net: Option<String>,
    pub sale_price_net: Option<String>,
    pub currency: Option<String>,

    pub min_stock: Option<String>,
    pub stock: Option<String>,
    pub is_service: Option<i32>,
    pub is_active: Option<i32>,
    pub location: Option<String>,
    pub weight_net: Option<String>,
    pub weight_gross: Option<String>,
    pub length: Option<String>,
    pub width: Option<String>,
    pub height: Option<String>,

    pub images: Option<String>,
    pub attributes: Option<String>,

    pub expiry_date: Option<String>,
    pub lot_number: Option<String>,
    pub country_of_origin: Option<String>,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = products)]
pub struct UpdateProduct {
    pub sku: Option<Option<String>>,
    pub ean: Option<Option<String>>,
    pub name: Option<String>,
    pub description: Option<Option<String>>,
    pub short_description: Option<Option<String>>,
    pub category: Option<Option<String>>,
    pub brand: Option<Option<String>>,
    pub model: Option<Option<String>>,

    pub unit: Option<Option<String>>,
    pub vat_rate: Option<Option<String>>,
    pub cn_code: Option<Option<String>>,
    pub pkwiu: Option<Option<String>>,
    pub gtu_code: Option<Option<String>>,
    pub ksef_procedure: Option<Option<String>>,

    pub purchase_price_net: Option<Option<String>>,
    pub sale_price_net: Option<Option<String>>,
    pub currency: Option<Option<String>>,

    pub min_stock: Option<Option<String>>,
    pub stock: Option<Option<String>>,
    pub is_service: Option<i32>,
    pub is_active: Option<i32>,
    pub location: Option<Option<String>>,
    pub weight_net: Option<Option<String>>,
    pub weight_gross: Option<Option<String>>,
    pub length: Option<Option<String>>,
    pub width: Option<Option<String>>,
    pub height: Option<Option<String>>,

    pub images: Option<Option<String>>,
    pub attributes: Option<Option<String>>,

    pub expiry_date: Option<Option<String>>,
    pub lot_number: Option<Option<String>>,
    pub country_of_origin: Option<Option<String>>,

    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = product_prices)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct ProductPrice {
    pub id: i32,
    pub product_id: i32,
    pub currency: String,
    pub price: String,
    pub valid_from: String,
    pub valid_to: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = product_prices)]
pub struct NewProductPrice {
    pub product_id: i32,
    pub currency: String,
    pub price: String,
    pub valid_from: String,
    pub valid_to: Option<String>,
}

pub fn create_product(conn: &mut SqliteConnection, new_product: NewProduct) -> Result<Product> {
    use crate::schema::products::dsl::*;

    let np = NewProduct {
        is_active: Some(new_product.is_active.unwrap_or(1)),
        ..new_product
    };

    diesel::insert_into(products)
        .values(&np)
        .returning(Product::as_returning())
        .get_result(conn)
        .context("Failed to insert product")
}

pub fn update_product(
    conn: &mut SqliteConnection,
    product_id: i32,
    changes: UpdateProduct,
) -> Result<Product> {
    use crate::schema::products::dsl::*;

    diesel::update(products.find(product_id))
        .set(changes)
        .returning(Product::as_returning())
        .get_result(conn)
        .with_context(|| format!("Failed to update product id={}", product_id))
}

pub fn delete_product(conn: &mut SqliteConnection, product_id_val: i32) -> Result<usize> {
    use crate::schema::products::dsl::*;

    diesel::delete(products.find(product_id_val))
        .execute(conn)
        .context("Failed to delete product")
}

pub fn fetch_product_by_id(conn: &mut SqliteConnection, product_id_val: i32) -> Result<Product> {
    use crate::schema::products::dsl::*;

    products
        .find(product_id_val)
        .first(conn)
        .with_context(|| format!("Failed to fetch product id={}", product_id_val))
}

pub fn list_products_for_company(
    conn: &mut SqliteConnection,
    company_id_val: i32,
    only_active: bool,
    limit: i64,
) -> Result<Vec<Product>> {
    use crate::schema::products::dsl::*;

    let mut q = products.filter(company_id.eq(company_id_val)).into_boxed();
    if only_active {
        q = q.filter(is_active.eq(1));
    }
    if limit > 0 {
        q = q.limit(limit);
    }
    q.order((name.asc(), id.asc()))
        .load(conn)
        .context("Failed to list products for company")
}

pub fn find_product_by_sku(conn: &mut SqliteConnection, company_id_val: i32, sku_val: &str) -> Result<Option<Product>> {
    use crate::schema::products::dsl::*;

    products
        .filter(company_id.eq(company_id_val))
        .filter(sku.eq(sku_val))
        .first(conn)
        .optional()
        .context("Failed to query product by sku")
}

pub fn create_product_price(conn: &mut SqliteConnection, new_price: NewProductPrice) -> Result<ProductPrice> {
    use crate::schema::product_prices::dsl::*;

    diesel::insert_into(product_prices)
        .values(&new_price)
        .returning(ProductPrice::as_returning())
        .get_result(conn)
        .context("Failed to insert product price")
}

pub fn get_prices_for_product(conn: &mut SqliteConnection, product_id_val: i32) -> Result<Vec<ProductPrice>> {
    use crate::schema::product_prices::dsl::*;

    product_prices
        .filter(product_id.eq(product_id_val))
        .order(valid_from.desc())
        .load(conn)
        .context("Failed to load product prices")
}

pub fn get_current_price(
    conn: &mut SqliteConnection,
    product_id_val: i32,
    currency_code: &str,
    at: &str,
) -> Result<Option<ProductPrice>> {
    use crate::schema::product_prices::dsl::*;

    let res: Option<ProductPrice> = product_prices
        .filter(product_id.eq(product_id_val))
        .filter(currency.eq(currency_code))
        .filter(valid_from.le(at))
        .filter(
            valid_to
                .is_null()
                .or(valid_to.gt(at))
        )
        .order(valid_from.desc())
        .first(conn)
        .optional()
        .context("Failed to query current product price")?;

    Ok(res)
}

pub fn delete_product_price(conn: &mut SqliteConnection, price_id_val: i32) -> Result<usize> {
    use crate::schema::product_prices::dsl::*;

    diesel::delete(product_prices.find(price_id_val))
        .execute(conn)
        .context("Failed to delete product price")
}
