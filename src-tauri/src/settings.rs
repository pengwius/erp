use crate::schema::settings;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Setting {
    pub id: i32,
    pub key: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = settings)]
pub struct NewSetting {
    pub key: String,
    pub value: String,
}

pub fn get_setting(conn: &mut SqliteConnection, setting_key: &str) -> QueryResult<Option<String>> {
    settings::table
        .filter(settings::key.eq(setting_key))
        .select(settings::value)
        .first(conn)
        .optional()
}

pub fn set_setting(conn: &mut SqliteConnection, setting_key: &str, setting_value: &str) -> QueryResult<()> {
    diesel::insert_into(settings::table)
        .values(&NewSetting { key: setting_key.to_string(), value: setting_value.to_string() })
        .on_conflict(settings::key)
        .do_update()
        .set(settings::value.eq(setting_value))
        .execute(conn)?;
    Ok(())
}
