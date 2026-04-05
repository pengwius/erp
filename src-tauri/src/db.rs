use crate::schema::companies;
use anyhow::{Context, Result};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use serde::{Deserialize, Serialize};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = companies)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Company {
    pub id: i32,
    pub name: String,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub created_at: NaiveDateTime,
    pub ksef_connected: bool,
    pub ksef_metadata: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = companies)]
pub struct NewCompany<'a> {
    pub name: &'a str,
    pub nip: Option<&'a str>,
    pub street: Option<&'a str>,
    pub city: Option<&'a str>,
    pub postal_code: Option<&'a str>,
    pub country: Option<&'a str>,
}

#[derive(AsChangeset)]
#[diesel(table_name = companies)]
pub struct UpdateCompany {
    pub name: Option<String>,
    pub nip: Option<Option<String>>,
    pub street: Option<Option<String>>,
    pub city: Option<Option<String>>,
    pub postal_code: Option<Option<String>>,
    pub country: Option<Option<String>>,
    pub ksef_connected: Option<bool>,
    pub ksef_metadata: Option<Option<String>>,
}

pub fn init_db(db_path: &str) -> Result<DbPool> {
    let manager = ConnectionManager::<SqliteConnection>::new(db_path);
    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .with_context(|| format!("Failed to create pool for {}", db_path))?;

    let mut conn = pool.get().context("Failed to get connection from pool")?;

    diesel::sql_query("PRAGMA journal_mode = WAL;")
        .execute(&mut conn)
        .context("Failed to set PRAGMA journal_mode")?;
    diesel::sql_query("PRAGMA foreign_keys = ON;")
        .execute(&mut conn)
        .context("Failed to set PRAGMA foreign_keys")?;

    conn.run_pending_migrations(MIGRATIONS)
        .map_err(|e| anyhow::anyhow!("Failed to run database migrations: {}", e))?;

    Ok(pool)
}

pub fn has_companies(conn: &mut SqliteConnection) -> Result<bool> {
    use crate::schema::companies::dsl::*;
    let count: i64 = companies.count().get_result(conn).context("Failed to count companies")?;
    Ok(count > 0)
}

pub fn create_company(
    conn: &mut SqliteConnection,
    new_company: NewCompany,
) -> Result<Company> {
    use crate::schema::companies::dsl::*;

    diesel::insert_into(companies)
        .values(&new_company)
        .returning(Company::as_returning())
        .get_result(conn)
        .context("Failed to insert company")
}

pub fn fetch_company_by_id(conn: &mut SqliteConnection, company_id: i32) -> Result<Company> {
    use crate::schema::companies::dsl::*;

    companies
        .find(company_id)
        .first(conn)
        .with_context(|| format!("Failed to fetch company with id={}", company_id))
}

pub fn list_companies(conn: &mut SqliteConnection) -> Result<Vec<Company>> {
    use crate::schema::companies::dsl::*;

    companies
        .order((created_at.desc(), id.desc()))
        .load(conn)
        .context("Failed to list companies")
}

pub fn update_company(
    conn: &mut SqliteConnection,
    company_id: i32,
    changes: UpdateCompany,
) -> Result<Company> {
    use crate::schema::companies::dsl::*;

    diesel::update(companies.find(company_id))
        .set(&changes)
        .returning(Company::as_returning())
        .get_result(conn)
        .with_context(|| format!("Failed to update company with id={}", company_id))
}
