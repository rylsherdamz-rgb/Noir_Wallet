use actix_web::{web, HttpResponse};
use serde_json::json;

pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "noir-backend"
    }))
}
