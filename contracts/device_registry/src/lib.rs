#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env};

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
    DeviceNotFound = 2,
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

    pub fn register(env: Env, device_hash: BytesN<32>, wallet: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::DeviceMap(device_hash.clone()), &wallet);

        env.events()
            .publish((symbol_short!("register"), device_hash), wallet);
    }

    pub fn get_wallet(env: Env, device_hash: BytesN<32>) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::DeviceMap(device_hash))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound))
    }
}
