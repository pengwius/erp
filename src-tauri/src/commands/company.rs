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
    #[serde(alias = "shortName")]
    pub short_name: Option<String>,
    pub regon: Option<String>,
    #[serde(alias = "buildingNumber")]
    pub building_number: Option<String>,
    #[serde(alias = "flatNumber")]
    pub flat_number: Option<String>,
    pub county: Option<String>,
    #[serde(alias = "postOffice")]
    pub post_office: Option<String>,
    #[serde(alias = "poBox")]
    pub po_box: Option<String>,
    pub voivodeship: Option<String>,
    pub website: Option<String>,
    pub email: Option<String>,
    pub currency: Option<String>,
    #[serde(alias = "initialBalance")]
    pub initial_balance: Option<String>,
    #[serde(alias = "operatorName")]
    pub operator_name: Option<String>,
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
            short_name: payload.short_name.as_deref(),
            regon: payload.regon.as_deref(),
            building_number: payload.building_number.as_deref(),
            flat_number: payload.flat_number.as_deref(),
            county: payload.county.as_deref(),
            post_office: payload.post_office.as_deref(),
            po_box: payload.po_box.as_deref(),
            voivodeship: payload.voivodeship.as_deref(),
            website: payload.website.as_deref(),
            email: payload.email.as_deref(),
            currency: payload.currency.as_deref(),
            initial_balance: payload.initial_balance.as_deref(),
            operator_name: payload.operator_name.as_deref(),
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
    #[serde(alias = "shortName")]
    pub short_name: Option<String>,
    pub regon: Option<String>,
    #[serde(alias = "buildingNumber")]
    pub building_number: Option<String>,
    #[serde(alias = "flatNumber")]
    pub flat_number: Option<String>,
    pub county: Option<String>,
    #[serde(alias = "postOffice")]
    pub post_office: Option<String>,
    #[serde(alias = "poBox")]
    pub po_box: Option<String>,
    pub voivodeship: Option<String>,
    pub website: Option<String>,
    pub email: Option<String>,
    pub currency: Option<String>,
    #[serde(alias = "initialBalance")]
    pub initial_balance: Option<String>,
    #[serde(alias = "operatorName")]
    pub operator_name: Option<String>,
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
            short_name: Some(payload.short_name),
            regon: Some(payload.regon),
            building_number: Some(payload.building_number),
            flat_number: Some(payload.flat_number),
            county: Some(payload.county),
            post_office: Some(payload.post_office),
            po_box: Some(payload.po_box),
            voivodeship: Some(payload.voivodeship),
            website: Some(payload.website),
            email: Some(payload.email),
            currency: Some(payload.currency),
            initial_balance: Some(payload.initial_balance),
            operator_name: Some(payload.operator_name),
            ksef_connected: payload.ksef_connected,
            ksef_metadata: Some(payload.ksef_metadata),
        };
        db::update_company(conn, payload.id, updates).map_err(|e| e.to_string())
    })
    .await
}
