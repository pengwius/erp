use crate::schema::customers;
use anyhow::{Context, Result};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = customers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Customer {
    pub id: i32,
    pub company_id: i32,
    pub name: String,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Deserialize, Insertable)]
#[diesel(table_name = customers)]
pub struct NewCustomer {
    pub company_id: i32,
    pub name: String,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Deserialize, AsChangeset)]
#[diesel(table_name = customers)]
pub struct UpdateCustomer {
    pub name: Option<String>,
    pub nip: Option<Option<String>>,
    pub street: Option<Option<String>>,
    pub city: Option<Option<String>>,
    pub postal_code: Option<Option<String>>,
    pub country: Option<Option<String>>,
    pub email: Option<Option<String>>,
    pub phone: Option<Option<String>>,
    pub updated_at: Option<String>,
}

pub fn create_customer(
    conn: &mut SqliteConnection,
    new_customer: NewCustomer,
) -> Result<Customer> {
    use crate::schema::customers::dsl::*;

    diesel::insert_into(customers)
        .values(&new_customer)
        .returning(Customer::as_returning())
        .get_result(conn)
        .context("Failed to insert customer")
}

pub fn update_customer(
    conn: &mut SqliteConnection,
    customer_id: i32,
    mut changes: UpdateCustomer,
) -> Result<Customer> {
    use crate::schema::customers::dsl::*;

    changes.updated_at = Some(chrono::Utc::now().to_rfc3339());

    diesel::update(customers.find(customer_id))
        .set(&changes)
        .returning(Customer::as_returning())
        .get_result(conn)
        .with_context(|| format!("Failed to update customer {}", customer_id))
}

pub fn delete_customer(
    conn: &mut SqliteConnection,
    customer_id: i32,
) -> Result<usize> {
    use crate::schema::customers::dsl::*;

    diesel::delete(customers.find(customer_id))
        .execute(conn)
        .with_context(|| format!("Failed to delete customer {}", customer_id))
}

pub fn get_customer(
    conn: &mut SqliteConnection,
    customer_id: i32,
) -> Result<Customer> {
    use crate::schema::customers::dsl::*;

    customers
        .find(customer_id)
        .first(conn)
        .with_context(|| format!("Failed to fetch customer {}", customer_id))
}

pub fn list_customers(
    conn: &mut SqliteConnection,
    company_id_filter: i32,
) -> Result<Vec<Customer>> {
    use crate::schema::customers::dsl::*;

    customers
        .filter(company_id.eq(company_id_filter))
        .order((created_at.desc(), id.desc()))
        .load(conn)
        .context("Failed to list customers")
}
