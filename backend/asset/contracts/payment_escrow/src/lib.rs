#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env, Vec};

pub mod agent_registry {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/agent_registry.wasm"
    );
}

pub mod device_registry {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/device_registry.wasm"
    );
}

#[contracttype]
pub enum DataKey {
    Admin,
    AgentRegistry,
    DeviceRegistry,
    EscrowBalance(BytesN<32>),
    PendingIndex(Address),
    PendingPayment((Address, u32)),
    AuthNonce((BytesN<32>, Address)),
}

#[contracttype]
pub struct Payment {
    pub device_hash: BytesN<32>,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    InsufficientBalance = 2,
    AgentNotAuthorized = 3,
    NotDeviceOwner = 4,
    NothingToClaim = 5,
    DuplicateAuth = 6,
    AgentStillActive = 7,
}

#[contract]
pub struct PaymentEscrow;

#[contractimpl]
impl PaymentEscrow {
    pub fn initialize(env: Env, admin: Address, agent_registry_id: Address, device_registry_id: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::AgentRegistry, &agent_registry_id);
        storage.set(&DataKey::DeviceRegistry, &device_registry_id);
    }

    pub fn fund_escrow(
        env: Env,
        token: Address,
        wallet: Address,
        device_hash: BytesN<32>,
        amount: i128,
    ) {
        wallet.require_auth();

        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&wallet, &env.current_contract_address(), &amount);

        let key = DataKey::EscrowBalance(device_hash.clone());
        let current = env
            .storage()
            .persistent()
            .get::<_, i128>(&key)
            .unwrap_or(0);
        env.storage().persistent().set(&key, &(current + amount));

        env.events()
            .publish((symbol_short!("fund"), device_hash), amount);
    }

    pub fn authorize(
        env: Env,
        agent: Address,
        device_hash: BytesN<32>,
        merchant: Address,
        asset: Address,
        amount: i128,
        nonce: u64,
    ) {
        agent.require_auth();

        // Replay protection: each (device, agent) pair carries a monotonically
        // increasing nonce. A replayed or stale request is rejected.
        let nonce_key = DataKey::AuthNonce((device_hash.clone(), agent.clone()));
        let last_nonce: u64 = env.storage().persistent().get(&nonce_key).unwrap_or(0);
        if nonce <= last_nonce {
            panic_with_error!(&env, Error::DuplicateAuth);
        }
        env.storage().persistent().set(&nonce_key, &nonce);

        let agent_registry_id: Address = env
            .storage()
            .persistent()
            .get(&DataKey::AgentRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotAuthorized));

        // Enforce the FULL constrained-authorization policy in one call: the
        // agent must match, the asset must be the approved one, the amount must
        // be positive and within the cap, and the authorization must not have
        // expired. The agent_registry owns these rules; the escrow only asks.
        let reg = agent_registry::Client::new(&env, &agent_registry_id);
        if !reg.check_payment(&device_hash, &agent, &asset, &amount) {
            panic_with_error!(&env, Error::AgentNotAuthorized);
        }

        let balance_key = DataKey::EscrowBalance(device_hash.clone());
        let balance = env
            .storage()
            .persistent()
            .get::<_, i128>(&balance_key)
            .unwrap_or(0);
        if balance < amount {
            panic_with_error!(&env, Error::InsufficientBalance);
        }

        env.storage()
            .persistent()
            .set(&balance_key, &(balance - amount));

        let idx_key = DataKey::PendingIndex(merchant.clone());
        let mut idx: u32 = env
            .storage()
            .persistent()
            .get(&idx_key)
            .unwrap_or(0);
        idx += 1;
        env.storage().persistent().set(&idx_key, &idx);

        let payment = Payment {
            device_hash: device_hash.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };
        env.storage()
            .temporary()
            .set(&DataKey::PendingPayment((merchant.clone(), idx)), &payment);

        env.events()
            .publish(
                (symbol_short!("authorize"), (device_hash, merchant)),
                amount,
            );
    }

    pub fn claim(env: Env, token: Address, merchant: Address) {
        merchant.require_auth();

        let idx_key = DataKey::PendingIndex(merchant.clone());
        let max_idx: u32 = env
            .storage()
            .persistent()
            .get(&idx_key)
            .unwrap_or(0);

        let mut total: i128 = 0;
        let mut claimed_indices: Vec<u32> = Vec::new(&env);

        for i in 1..=max_idx {
            let payment_key = DataKey::PendingPayment((merchant.clone(), i));
            if let Some(payment) = env
                .storage()
                .temporary()
                .get::<_, Payment>(&payment_key)
            {
                total += payment.amount;
                claimed_indices.push_back(i);
            }
        }

        if total == 0 {
            panic_with_error!(&env, Error::NothingToClaim);
        }

        for idx in claimed_indices.iter() {
            let key = DataKey::PendingPayment((merchant.clone(), idx));
            env.storage().temporary().remove(&key);
        }

        env.storage().persistent().set(&idx_key, &0u32);

        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(
            &env.current_contract_address(),
            &merchant,
            &total,
        );

        env.events()
            .publish((symbol_short!("claim"), merchant), total);
    }

    pub fn defund_escrow(
        env: Env,
        token: Address,
        device_hash: BytesN<32>,
        amount: i128,
    ) {
        let device_registry_id: Address = env
            .storage()
            .persistent()
            .get(&DataKey::DeviceRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotDeviceOwner));

        let reg = device_registry::Client::new(&env, &device_registry_id);
        let owner = reg.get_owner(&device_hash);
        owner.require_auth();

        let balance_key = DataKey::EscrowBalance(device_hash.clone());
        let balance = env
            .storage()
            .persistent()
            .get::<_, i128>(&balance_key)
            .unwrap_or(0);
        if balance < amount {
            panic_with_error!(&env, Error::InsufficientBalance);
        }

        env.storage()
            .persistent()
            .set(&balance_key, &(balance - amount));

        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(
            &env.current_contract_address(),
            &owner,
            &amount,
        );

        env.events()
            .publish((symbol_short!("defund"), device_hash), amount);
    }

    /// Return a device's ENTIRE remaining escrow balance to its owner once the
    /// agent authorization has been revoked.
    ///
    /// This is the on-revoke sweep: after the wallet owner calls
    /// `agent_registry.revoke_agent`, the device has no authorized agent and
    /// its escrow should no longer sit locked. This method confirms there is no
    /// longer an active authorization for `agent` on the device, then transfers
    /// the whole balance back to the owner (resolved from `device_registry`).
    ///
    /// Guarded so it cannot be used to pull funds while an agent is still live:
    /// if the agent is still authorized, it panics `AgentStillActive`.
    pub fn sweep_on_revoke(
        env: Env,
        token: Address,
        device_hash: BytesN<32>,
        agent: Address,
    ) -> i128 {
        let device_registry_id: Address = env
            .storage()
            .persistent()
            .get(&DataKey::DeviceRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotDeviceOwner));

        let dev_reg = device_registry::Client::new(&env, &device_registry_id);
        let owner = dev_reg.get_owner(&device_hash);
        owner.require_auth();

        // The sweep is only valid after revocation. If the agent is still
        // authorized in the agent_registry, refuse — otherwise this would be a
        // way to drain an active escrow out from under a working agent.
        let agent_registry_id: Address = env
            .storage()
            .persistent()
            .get(&DataKey::AgentRegistry)
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotAuthorized));
        let agent_reg = agent_registry::Client::new(&env, &agent_registry_id);
        if agent_reg.is_auth(&device_hash, &agent) {
            panic_with_error!(&env, Error::AgentStillActive);
        }

        let balance_key = DataKey::EscrowBalance(device_hash.clone());
        let balance = env
            .storage()
            .persistent()
            .get::<_, i128>(&balance_key)
            .unwrap_or(0);

        if balance <= 0 {
            return 0;
        }

        env.storage().persistent().set(&balance_key, &0i128);

        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(
            &env.current_contract_address(),
            &owner,
            &balance,
        );

        env.events()
            .publish((symbol_short!("sweep"), device_hash), balance);

        balance
    }

    pub fn balance_of(env: Env, device_hash: BytesN<32>) -> i128 {
        env.storage()
            .persistent()
            .get::<_, i128>(&DataKey::EscrowBalance(device_hash))
            .unwrap_or(0)
    }

    pub fn pending_balance(env: Env, merchant: Address) -> i128 {
        let idx_key = DataKey::PendingIndex(merchant.clone());
        let max_idx: u32 = env
            .storage()
            .persistent()
            .get(&idx_key)
            .unwrap_or(0);

        let mut total: i128 = 0;
        for i in 1..=max_idx {
            let payment_key = DataKey::PendingPayment((merchant.clone(), i));
            if let Some(payment) = env
                .storage()
                .temporary()
                .get::<_, Payment>(&payment_key)
            {
                total += payment.amount;
            }
        }
        total
    }
}
