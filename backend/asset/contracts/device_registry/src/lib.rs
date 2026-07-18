#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    WalletDeviceCount(Address),
    WalletDeviceByIndex(Address, u32),
    Device(BytesN<32>),
}

#[contracttype]
pub struct DeviceInfo {
    pub owner: Address,
    pub agent: Address,
    pub status: u32,
    pub created_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    DeviceNotFound = 2,
    NotOwner = 3,
    AlreadyRegistered = 4,
}

#[contract]
pub struct DeviceRegistry;

#[contractimpl]
impl DeviceRegistry {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
    }

    pub fn register(env: Env, wallet: Address, device_hash: BytesN<32>, agent: Address) {
        wallet.require_auth();

        let device_key = DataKey::Device(device_hash.clone());
        if env.storage().persistent().has(&device_key) {
            panic_with_error!(&env, Error::AlreadyRegistered);
        }

        let ledger = env.ledger();
        let info = DeviceInfo {
            owner: wallet.clone(),
            agent: agent.clone(),
            status: 0,
            created_at: ledger.timestamp(),
        };
        env.storage().persistent().set(&device_key, &info);

        let count_key = DataKey::WalletDeviceCount(wallet.clone());
        let count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);
        env.storage().persistent().set(&DataKey::WalletDeviceByIndex(wallet.clone(), count), &device_hash.clone());
        env.storage().persistent().set(&count_key, &(count + 1));

        env.events().publish((symbol_short!("register"), device_hash), agent);
    }

    pub fn revoke(env: Env, wallet: Address, device_hash: BytesN<32>) {
        wallet.require_auth();

        let device_key = DataKey::Device(device_hash.clone());
        let mut info: DeviceInfo = env.storage().persistent()
            .get(&device_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound));

        if info.owner != wallet {
            panic_with_error!(&env, Error::NotOwner);
        }

        info.status = 1;
        env.storage().persistent().set(&device_key, &info);

        env.events().publish((symbol_short!("revoke"), device_hash), ());
    }

    pub fn get_device(env: Env, device_hash: BytesN<32>) -> DeviceInfo {
        env.storage().persistent()
            .get(&DataKey::Device(device_hash.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound))
    }

    pub fn wallet_device_count(env: Env, wallet: Address) -> u32 {
        env.storage().persistent()
            .get(&DataKey::WalletDeviceCount(wallet))
            .unwrap_or(0)
    }

    pub fn wallet_device_at(env: Env, wallet: Address, index: u32) -> BytesN<32> {
        env.storage().persistent()
            .get(&DataKey::WalletDeviceByIndex(wallet, index))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound))
    }

    pub fn is_authorized(env: Env, device_hash: BytesN<32>, agent: Address) -> bool {
        env.storage().persistent()
            .get::<_, DeviceInfo>(&DataKey::Device(device_hash.clone()))
            .map(|info| info.agent == agent && info.status == 0)
            .unwrap_or(false)
    }

    pub fn get_agent(env: Env, device_hash: BytesN<32>) -> Address {
        let info: DeviceInfo = env.storage().persistent()
            .get(&DataKey::Device(device_hash.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound));
        info.agent
    }

    pub fn get_owner(env: Env, device_hash: BytesN<32>) -> Address {
        let info: DeviceInfo = env.storage().persistent()
            .get(&DataKey::Device(device_hash.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, Error::DeviceNotFound));
        info.owner
    }
}
