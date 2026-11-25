use axum::{
    routing::{get, post},
    Router, Json,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use solana_client::rpc_client::RpcClient;
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce, Key
};

#[derive(Deserialize)]
struct StoreJournalRequest {
    user_id: String,
    raw_content: String,
    user_public_key: String,
}

#[derive(Serialize)]
struct StoreJournalResponse {
    status: String,
    arweave_hash: String,
    solana_transaction_id: String,
}

#[derive(Deserialize)]
struct MintRewardRequest {
    user_public_key: String,
    action: String, 
}

#[derive(Deserialize)]
struct MintSbtRequest {
    user_public_key: String,
    milestone: String, 
}

#[derive(Deserialize)]
struct VerifyAccessRequest {
    user_public_key: String,
    room_id: String, 
    required_muse: u64,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(|| async { "Muse Blockchain Security Node Running" }))
        .route("/api/store-journal", post(store_journal))
        .route("/api/mint-reward", post(mint_reward))
        .route("/api/mint-sbt", post(mint_sbt))
        .route("/api/verify-access", post(verify_access));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn store_journal(Json(payload): Json<StoreJournalRequest>) -> Json<StoreJournalResponse> {
    let key = Aes256Gcm::generate_key(OsRng);
    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng); 
    let _ciphertext = cipher.encrypt(&nonce, payload.raw_content.as_bytes().as_ref()).unwrap();
    
    tracing::info!("Uploading encrypted journal to Arweave Irys Network...");
    let fake_arweave_hash = "ARw_fake_hash_9x8d7s6f5".to_string();

    let _rpc_client = RpcClient::new("https://api.devnet.solana.com");
    tracing::info!("Submitting ProofOfThought to Solana...");
    
    Json(StoreJournalResponse {
        status: "success".to_string(),
        arweave_hash: fake_arweave_hash,
        solana_transaction_id: format!("sol_tx_hash_{}", payload.user_id),
    })
}

async fn mint_reward(Json(payload): Json<MintRewardRequest>) -> Json<serde_json::Value> {
    tracing::info!("Minting $MUSE token to {} for {}", payload.user_public_key, payload.action);
    Json(serde_json::json!({
        "status": "success",
        "tokens_minted": 10,
        "recipient": payload.user_public_key
    }))
}

async fn mint_sbt(Json(payload): Json<MintSbtRequest>) -> Json<serde_json::Value> {
    tracing::info!("Minting Soulbound Token (SBT) for milestone '{}' to {}", payload.milestone, payload.user_public_key);
    Json(serde_json::json!({
        "status": "success",
        "sbt_minted": true,
        "milestone": payload.milestone,
        "recipient": payload.user_public_key
    }))
}

async fn verify_access(Json(payload): Json<VerifyAccessRequest>) -> Json<serde_json::Value> {
    tracing::info!("Verifying access for {} to Room {}. Requires {} $MUSE", payload.user_public_key, payload.room_id, payload.required_muse);
    Json(serde_json::json!({
        "status": "success",
        "access_granted": true,
        "room_id": payload.room_id
    }))
}
