use axum::{
    routing::{get, post},
    Router, Json,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Deserialize)]
struct LogRequest {
    user_id: String,
    content_hash: String,
}

#[derive(Serialize)]
struct LogResponse {
    status: String,
    transaction_id: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(|| async { "Muse Blockchain Security Node Running" }))
        .route("/api/log-hash", post(log_hash));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn log_hash(Json(payload): Json<LogRequest>) -> Json<LogResponse> {
    // Placeholder for actual blockchain transaction logging
    Json(LogResponse {
        status: "success".to_string(),
        transaction_id: format!("tx_{}", payload.content_hash),
    })
}
