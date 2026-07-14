#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    AgentMap(BytesN<32>),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    AgentNotFound = 2,
}

#[contract]
pub struct AgentRegistry;

#[contractimpl]
impl AgentRegistry {
    pub fn initialize(env: Env, admin: Address) {
        let storage = env.storage().instance();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
    }

    pub fn register_agent(env: Env, wallet: Address, device_hash: BytesN<32>, agent: Address) {
        wallet.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::AgentMap(device_hash.clone()), &agent);

        env.events()
            .publish((symbol_short!("agent_reg"), device_hash), agent);
    }

    pub fn revoke_agent(env: Env, wallet: Address, device_hash: BytesN<32>) {
        wallet.require_auth();

        if !env.storage().persistent().has(&DataKey::AgentMap(device_hash.clone())) {
            panic_with_error!(&env, Error::AgentNotFound);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::AgentMap(device_hash.clone()));

        env.events()
            .publish((symbol_short!("agent_rev"), device_hash), ());
    }

    pub fn get_agent(env: Env, device_hash: BytesN<32>) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::AgentMap(device_hash))
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotFound))
    }

    pub fn is_auth(env: Env, device_hash: BytesN<32>, agent: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AgentMap(device_hash.clone()))
            .map(|stored: Address| stored == agent)
            .unwrap_or(false)
    }
}
