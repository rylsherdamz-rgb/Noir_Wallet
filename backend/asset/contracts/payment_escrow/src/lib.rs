#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, symbol_short, Address, BytesN, Env, Symbol, Val, Vec, IntoVal};

#[contracttype]
pub enum DataKey {
    Admin,
    AgentRegistry,
    EscrowBalance(BytesN<32>),
    PendingIndex,
    PendingPayment((Address, u32)),
    DeviceOwner(BytesN<32>),
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
}

#[contract]
pub struct PaymentEscrow;

fn get_agent_registry(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&DataKey::AgentRegistry)
        .unwrap()
}

#[contractimpl]
impl PaymentEscrow {
    pub fn initialize(env: Env, admin: Address, agent_registry_id: Address) {
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::AgentRegistry, &agent_registry_id);
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

        let owner_key = DataKey::DeviceOwner(device_hash.clone());
        if !env.storage().persistent().has(&owner_key) {
            env.storage()
                .persistent()
                .set(&owner_key, &wallet);
        }

        env.events()
            .publish((symbol_short!("fund"), device_hash), amount);
    }

    pub fn authorize(
        env: Env,
        agent: Address,
        device_hash: BytesN<32>,
        merchant: Address,
        amount: i128,
    ) {
        agent.require_auth();

        let agent_registry_id = get_agent_registry(&env);
        let args: Vec<Val> = (device_hash.clone(), agent.clone()).into_val(&env);
        let is_auth: bool = env.invoke_contract(
            &agent_registry_id,
            &Symbol::new(&env, "is_auth"),
            args,
        );
        if !is_auth {
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

        let pending_index_key = DataKey::PendingIndex;
        let mut pending_idx: u32 = env
            .storage()
            .instance()
            .get(&pending_index_key)
            .unwrap_or(0);
        pending_idx += 1;
        env.storage()
            .instance()
            .set(&pending_index_key, &pending_idx);

        let payment = Payment {
            device_hash: device_hash.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };
        let payment_key = DataKey::PendingPayment((merchant.clone(), pending_idx));
        env.storage()
            .temporary()
            .set(&payment_key, &payment);

        env.events()
            .publish(
                (symbol_short!("authorize"), (device_hash, merchant)),
                amount,
            );
    }

    pub fn claim(env: Env, token: Address, merchant: Address) {
        merchant.require_auth();

        let pending_index_key = DataKey::PendingIndex;
        let max_idx: u32 = env
            .storage()
            .instance()
            .get(&pending_index_key)
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
        let owner_key = DataKey::DeviceOwner(device_hash.clone());
        let owner: Address = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotDeviceOwner));
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

    pub fn balance_of(env: Env, device_hash: BytesN<32>) -> i128 {
        env.storage()
            .persistent()
            .get::<_, i128>(&DataKey::EscrowBalance(device_hash))
            .unwrap_or(0)
    }

    pub fn pending_balance(env: Env, merchant: Address) -> i128 {
        let pending_index_key = DataKey::PendingIndex;
        let max_idx: u32 = env
            .storage()
            .instance()
            .get(&pending_index_key)
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
