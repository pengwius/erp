use crate::db;
use crate::run_db_task;

#[tauri::command]
pub async fn cmd_has_companies() -> Result<bool, String> {
    run_db_task(|conn| db::has_companies(conn).map_err(|e| e.to_string())).await
}

#[derive(serde::Deserialize)]
pub struct CreateCompanyPayload {
    pub name: String,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    #[serde(alias = "postalCode", alias = "postCode", alias = "postal")]
    pub postal_code: Option<String>,
    pub country: Option<String>,
}

#[tauri::command]
pub async fn cmd_create_company(payload: CreateCompanyPayload) -> Result<db::Company, String> {
    run_db_task(move |conn| {
        let new_company = db::NewCompany {
            name: &payload.name,
            nip: payload.nip.as_deref(),
            street: payload.street.as_deref(),
            city: payload.city.as_deref(),
            postal_code: payload.postal_code.as_deref(),
            country: payload.country.as_deref(),
        };
        db::create_company(conn, new_company).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_list_companies() -> Result<Vec<db::Company>, String> {
    run_db_task(|conn| db::list_companies(conn).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_get_company(id: i32) -> Result<db::Company, String> {
    run_db_task(move |conn| db::fetch_company_by_id(conn, id).map_err(|e| e.to_string())).await
}

#[derive(serde::Deserialize)]
pub struct UpdateCompanyPayload {
    pub id: i32,
    pub name: Option<String>,
    pub nip: Option<String>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub ksef_connected: Option<bool>,
    pub ksef_metadata: Option<String>,
}

#[tauri::command]
pub async fn cmd_update_company(payload: UpdateCompanyPayload) -> Result<db::Company, String> {
    run_db_task(move |conn| {
        let updates = db::UpdateCompany {
            name: payload.name,
            nip: Some(payload.nip),
            street: Some(payload.street),
            city: Some(payload.city),
            postal_code: Some(payload.postal_code),
            country: Some(payload.country),
            ksef_connected: payload.ksef_connected,
            ksef_metadata: Some(payload.ksef_metadata),
        };
        db::update_company(conn, payload.id, updates).map_err(|e| e.to_string())
    })
    .await
}

