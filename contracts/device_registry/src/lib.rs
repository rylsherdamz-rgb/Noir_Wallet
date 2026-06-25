#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN};

#[contracttype]
pub enum DataKey {
    Admin,
    DeviceMap(BytesN<32>),
}

#[contract]
pub struct DeviceRegistry;

#[contractimpl]
impl DeviceRegistry {}
