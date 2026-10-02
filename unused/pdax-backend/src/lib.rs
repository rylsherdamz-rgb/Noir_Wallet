//! Noir Wallet PDAX bridge.
//!
//! This crate converts PHP to and from crypto through PDAX. It is deliberately
//! not in the payment path: device registration, agent authorisation, tap
//! authorisation, and settlement all live on-chain in the Soroban contracts.
//! Nothing here talks to Stellar, builds a transaction, or holds a wallet key.

pub mod api;
pub mod auth;
pub mod config;
pub mod crypto;
pub mod db;
pub mod errors;
pub mod metrics;
pub mod models;
pub mod money;
pub mod pdax;
pub mod rate_limiter;
pub mod state;

pub use state::AppState;
