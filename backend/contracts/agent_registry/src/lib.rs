#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    /// device_hash -> AgentPolicy (the constrained authorization)
    AgentMap(BytesN<32>),
}

/// The constrained delegated-payment authorization for a device.
///
/// A wallet owner authorizes a signing key (`agent`) to spend from the device
/// escrow, but only within this policy. `PaymentEscrow.authorize` reads it back
/// and enforces every field before releasing funds.
#[contracttype]
#[derive(Clone)]
pub struct AgentPolicy {
    /// The authorized signing key.
    pub agent: Address,
    /// Maximum amount a single payment may spend. `0` means "no explicit cap".
    pub max_amount: i128,
    /// The only asset (token contract) this agent may spend.
    pub asset: Address,
    /// Absolute ledger timestamp after which the authorization is invalid.
    /// `0` means "never expires".
    pub expires_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    AgentNotFound = 2,
    AlreadyRegistered = 3,
    InvalidPolicy = 4,
}

#[contract]
pub struct AgentRegistry;

#[contractimpl]
impl AgentRegistry {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
    }

    /// Authorize `agent` for `device_hash` under a constrained policy.
    ///
    /// - `max_amount` caps a single payment (`0` = uncapped).
    /// - `asset` is the only token the agent may spend.
    /// - `expires_at` is an absolute ledger timestamp (`0` = never expires); a
    ///   non-zero value in the past is rejected as an invalid policy.
    pub fn register_agent(
        env: Env,
        wallet: Address,
        device_hash: BytesN<32>,
        agent: Address,
        max_amount: i128,
        asset: Address,
        expires_at: u64,
    ) {
        wallet.require_auth();

        if max_amount < 0 {
            panic_with_error!(&env, Error::InvalidPolicy);
        }
        if expires_at != 0 && expires_at <= env.ledger().timestamp() {
            panic_with_error!(&env, Error::InvalidPolicy);
        }

        let map_key = DataKey::AgentMap(device_hash.clone());
        if env.storage().persistent().has(&map_key) {
            panic_with_error!(&env, Error::AlreadyRegistered);
        }

        let policy = AgentPolicy {
            agent: agent.clone(),
            max_amount,
            asset,
            expires_at,
        };
        env.storage().persistent().set(&map_key, &policy);

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
        Self::get_policy(env, device_hash).agent
    }

    /// Read back the full authorization policy. Panics `AgentNotFound` if none.
    pub fn get_policy(env: Env, device_hash: BytesN<32>) -> AgentPolicy {
        env.storage()
            .persistent()
            .get(&DataKey::AgentMap(device_hash))
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotFound))
    }

    /// True only if `agent` is the authorized key AND the authorization has not
    /// expired. `PaymentEscrow.authorize` calls this as the first gate.
    pub fn is_auth(env: Env, device_hash: BytesN<32>, agent: Address) -> bool {
        env.storage()
            .persistent()
            .get::<_, AgentPolicy>(&DataKey::AgentMap(device_hash))
            .map(|p| p.agent == agent && !Self::is_expired(&env, &p))
            .unwrap_or(false)
    }

    /// True when the agent is authorized, the asset matches the policy, the
    /// amount is within the cap, and the authorization has not expired. This is
    /// the single enforcement predicate `PaymentEscrow` uses so the policy
    /// rules live in one place.
    pub fn check_payment(
        env: Env,
        device_hash: BytesN<32>,
        agent: Address,
        asset: Address,
        amount: i128,
    ) -> bool {
        env.storage()
            .persistent()
            .get::<_, AgentPolicy>(&DataKey::AgentMap(device_hash))
            .map(|p| {
                p.agent == agent
                    && p.asset == asset
                    && amount > 0
                    && (p.max_amount == 0 || amount <= p.max_amount)
                    && !Self::is_expired(&env, &p)
            })
            .unwrap_or(false)
    }

    fn is_expired(env: &Env, policy: &AgentPolicy) -> bool {
        policy.expires_at != 0 && env.ledger().timestamp() > policy.expires_at
    }
}
