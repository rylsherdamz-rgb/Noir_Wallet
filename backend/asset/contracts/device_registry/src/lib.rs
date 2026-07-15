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
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
    }

    pub fn register(env: Env, device_hash: BytesN<32>, wallet: Address) {
        wallet.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::DeviceMap(device_hash.clone()), &wallet);

        env.events()
            .publish((symbol_short!("register"), device_hash), wallet);
    }

    pub fn unregister(env: Env, admin: Address, device_hash: BytesN<32>) {
        admin.require_auth();

        if !env
            .storage()
            .persistent()
            .has(&DataKey::DeviceMap(device_hash.clone()))
        {
            panic_with_error!(&env, Error::DeviceNotFound);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::DeviceMap(device_hash.clone()));

        env.events()
            .publish((symbol_short!("revoke"), device_hash), ());
    }

    pub fn get_wallet(env: Env, device_hash: BytesN<32>) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::DeviceMap(device_hash))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound))
    }
}
