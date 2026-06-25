#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    DeviceMap(BytesN<32>),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
}

#[contract]
pub struct DeviceRegistry;

#[contractimpl]
impl DeviceRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }
}
