use crate::product;
use crate::run_db_task;
use crate::APP_DIR;
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use diesel::RunQueryDsl;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(serde::Deserialize)]
pub struct CreateProductPayload {
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
    pub images: Option<serde_json::Value>,
    pub attributes: Option<serde_json::Value>,
    pub expiry_date: Option<String>,
    pub lot_number: Option<String>,
    pub country_of_origin: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct UpdateProductPayload {
    pub id: i32,
    pub sku: Option<String>,
    pub ean: Option<String>,
    pub name: Option<String>,
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
    pub images: Option<serde_json::Value>,
    pub attributes: Option<serde_json::Value>,
    pub expiry_date: Option<String>,
    pub lot_number: Option<String>,
    pub country_of_origin: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct CreateProductPricePayload {
    pub product_id: i32,
    pub currency: String,
    pub price: String,
    pub valid_from: String,
    pub valid_to: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct GetCurrentPricePayload {
    pub product_id: i32,
    pub currency: String,
    pub at: Option<String>,
}

fn save_images_to_appdir(images_opt: Option<serde_json::Value>) -> Option<String> {
    let imgs = images_opt?;
    let arr = imgs.as_array()?;
    let mut saved: Vec<String> = Vec::with_capacity(arr.len());

    let app_dir: PathBuf = APP_DIR
        .get()
        .cloned()
        .unwrap_or_else(|| std::env::temp_dir());

    let upload_dir = app_dir.join("uploads");
    let _ = std::fs::create_dir_all(&upload_dir);

    for el in arr.iter() {
        if let Some(s) = el.as_str() {
            if s.starts_with("data:") {
                if let Some(pos) = s.find(',') {
                    let meta = &s[..pos];
                    let data = &s[pos + 1..];
                    let mime = meta
                        .split(';')
                        .next()
                        .and_then(|m| m.strip_prefix("data:"))
                        .unwrap_or("application/octet-stream");
                    let ext = if mime.contains("png") {
                        "png"
                    } else if mime.contains("jpeg") || mime.contains("jpg") {
                        "jpg"
                    } else if mime.contains("gif") {
                        "gif"
                    } else {
                        "bin"
                    };
                    let filename = format!("{}.{}", Uuid::new_v4().to_string(), ext);
                    let path = upload_dir.join(&filename);
                    if let Ok(bytes) = BASE64.decode(data) {
                        if let Err(e) = std::fs::write(&path, bytes) {
                            eprintln!("Failed to write image file {}: {}", path.display(), e);
                            saved.push(s.to_string());
                            continue;
                        }
                        let rel = format!("uploads/{}", filename);
                        saved.push(rel);
                        continue;
                    } else {
                        saved.push(s.to_string());
                        continue;
                    }
                } else {
                    saved.push(s.to_string());
                    continue;
                }
            } else {
                saved.push(s.to_string());
                continue;
            }
        } else {
            saved.push(el.to_string());
        }
    }

    serde_json::to_string(&saved).ok()
}

#[tauri::command]
pub async fn cmd_create_product(payload: CreateProductPayload) -> Result<product::Product, String> {
    run_db_task(move |conn| {
        let images_s: Option<String> = save_images_to_appdir(payload.images.clone())
            .or_else(|| payload.images.and_then(|v| serde_json::to_string(&v).ok()));
        let attributes_s: Option<String> = payload
            .attributes
            .and_then(|v| serde_json::to_string(&v).ok());

        let np = product::NewProduct {
            company_id: payload.company_id,
            sku: payload.sku,
            ean: payload.ean,
            name: payload.name,
            description: payload.description,
            short_description: payload.short_description,
            category: payload.category,
            brand: payload.brand,
            model: payload.model,
            unit: payload.unit,
            vat_rate: payload.vat_rate,
            cn_code: payload.cn_code,
            pkwiu: payload.pkwiu,
            gtu_code: payload.gtu_code,
            ksef_procedure: payload.ksef_procedure,
            purchase_price_net: payload.purchase_price_net,
            sale_price_net: payload.sale_price_net,
            currency: payload.currency,
            min_stock: payload.min_stock,
            stock: payload.stock,
            is_service: payload.is_service,
            is_active: payload.is_active,
            location: payload.location,
            weight_net: payload.weight_net,
            weight_gross: payload.weight_gross,
            length: payload.length,
            width: payload.width,
            height: payload.height,
            images: images_s,
            attributes: attributes_s,
            expiry_date: payload.expiry_date,
            lot_number: payload.lot_number,
            country_of_origin: payload.country_of_origin,
        };
        {
            match product::create_product(conn, np) {
                Ok(p) => Ok(p),
                Err(err) => {
                    let s = err.to_string();
                    eprintln!("cmd_create_product failed inserting product: {:?}", s);
                    Err(s)
                }
            }
        }
    })
    .await
}

#[tauri::command]
pub async fn cmd_update_product(payload: UpdateProductPayload) -> Result<product::Product, String> {
    run_db_task(move |conn| {
        let images_s: Option<String> = save_images_to_appdir(payload.images.clone())
            .or_else(|| payload.images.and_then(|v| serde_json::to_string(&v).ok()));
        let attributes_s: Option<String> = payload
            .attributes
            .and_then(|v| serde_json::to_string(&v).ok());

        let changes = product::UpdateProduct {
            sku: Some(payload.sku),
            ean: Some(payload.ean),
            name: payload.name,
            description: Some(payload.description),
            short_description: Some(payload.short_description),
            category: Some(payload.category),
            brand: Some(payload.brand),
            model: Some(payload.model),
            unit: Some(payload.unit),
            vat_rate: Some(payload.vat_rate),
            cn_code: Some(payload.cn_code),
            pkwiu: Some(payload.pkwiu),
            gtu_code: Some(payload.gtu_code),
            ksef_procedure: Some(payload.ksef_procedure),
            purchase_price_net: Some(payload.purchase_price_net),
            sale_price_net: Some(payload.sale_price_net),
            currency: Some(payload.currency),
            min_stock: Some(payload.min_stock),
            stock: Some(payload.stock),
            is_service: payload.is_service,
            is_active: payload.is_active,
            location: Some(payload.location),
            weight_net: Some(payload.weight_net),
            weight_gross: Some(payload.weight_gross),
            length: Some(payload.length),
            width: Some(payload.width),
            height: Some(payload.height),
            images: Some(images_s),
            attributes: Some(attributes_s),
            expiry_date: Some(payload.expiry_date),
            lot_number: Some(payload.lot_number),
            country_of_origin: Some(payload.country_of_origin),
            updated_at: None,
        };
        product::update_product(conn, payload.id, changes).map_err(|e| {
            eprintln!(
                "cmd_update_product failed updating id {}: {:?}",
                payload.id, e
            );
            e.to_string()
        })
    })
    .await
}

#[tauri::command]
pub async fn cmd_delete_product(id: i32) -> Result<usize, String> {
    run_db_task(move |conn| product::delete_product(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_delete_product_price(price_id: i32) -> Result<usize, String> {
    run_db_task(move |conn| {
        product::delete_product_price(conn, price_id).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_image(path: String) -> Result<String, String> {
    let app_dir: PathBuf = crate::APP_DIR
        .get()
        .cloned()
        .unwrap_or_else(|| std::env::temp_dir());
    let full_path = app_dir.join(path);
    let bytes = std::fs::read(&full_path).map_err(|e| e.to_string())?;
    Ok(BASE64.encode(bytes))
}

#[tauri::command]
pub async fn cmd_list_products(
    company_id: i32,
    only_active: Option<bool>,
    limit: Option<i64>,
) -> Result<Vec<product::Product>, String> {
    let only = only_active.unwrap_or(true);
    let lim = limit.unwrap_or(100);
    run_db_task(move |conn| {
        product::list_products_for_company(conn, company_id, only, lim).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_product(id: i32) -> Result<product::Product, String> {
    run_db_task(move |conn| product::fetch_product_by_id(conn, id).map_err(|e| e.to_string())).await
}

#[tauri::command]
pub async fn cmd_create_product_price(
    payload: CreateProductPricePayload,
) -> Result<product::ProductPrice, String> {
    run_db_task(move |conn| {
        let np = product::NewProductPrice {
            product_id: payload.product_id,
            currency: payload.currency,
            price: payload.price,
            valid_from: payload.valid_from,
            valid_to: payload.valid_to,
        };
        product::create_product_price(conn, np).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_list_product_prices(
    product_id: i32,
) -> Result<Vec<product::ProductPrice>, String> {
    run_db_task(move |conn| {
        product::get_prices_for_product(conn, product_id).map_err(|e| e.to_string())
    })
    .await
}

#[tauri::command]
pub async fn cmd_get_current_price(
    payload: GetCurrentPricePayload,
) -> Result<Option<product::ProductPrice>, String> {
    let at_time = payload
        .at
        .unwrap_or_else(|| chrono::Local::now().format("%Y-%m-%dT%H:%M:%S").to_string());
    run_db_task(move |conn| {
        product::get_current_price(conn, payload.product_id, &payload.currency, &at_time)
            .map_err(|e| e.to_string())
    })
    .await
}
