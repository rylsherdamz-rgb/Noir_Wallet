#[cfg(test)]
mod tests {
    use payment_escrow::PaymentEscrow;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{token, Address, BytesN, Env, IntoVal};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    fn deploy_agent_registry(env: &Env, admin: &Address) -> Address {
        let contract_id = env.register(
            agent_registry::AgentRegistry,
            (),
        );
        let client = agent_registry::Client::new(env, &contract_id);
        client.initialize(admin);
        contract_id
    }

    fn create_token(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient) {
        let sac = env.register_stellar_asset_contract(admin.clone());
        let sac_client = token::StellarAssetClient::new(env, &sac);
        (sac, sac_client)
    }

    #[test]
    fn test_initialize_happy_path() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let agent_registry_id = deploy_agent_registry(&env, &admin);

        let contract_id = env.register(PaymentEscrow, ());
        env.as_contract(&contract_id, || {
            PaymentEscrow::initialize(env.clone(), admin, agent_registry_id);
        });
    }

    #[test]
    #[should_panic]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let agent_registry_id = deploy_agent_registry(&env, &admin);

        let contract_id = env.register(PaymentEscrow, ());
        env.as_contract(&contract_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id.clone());
            PaymentEscrow::initialize(env.clone(), random_address(&env), agent_registry_id);
        });
    }

    #[test]
    fn test_fund_escrow_increases_balance() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let merchant = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        sac_client.mint(&wallet, &1000);

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);

        let balance = escrow_client.balance_of(&device_hash);
        assert_eq!(balance, 500);
    }

    #[test]
    fn test_authorize_and_claim_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let merchant = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        agent_registry::Client::new(&env, &agent_registry_id)
            .register_agent(&wallet, &device_hash, &agent);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);

        escrow_client.authorize(&agent, &device_hash, &merchant, &200);

        let balance_after = escrow_client.balance_of(&device_hash);
        assert_eq!(balance_after, 300);

        let pending = escrow_client.pending_balance(&merchant);
        assert_eq!(pending, 200);
    }

    #[test]
    fn test_defund_escrow_returns_funds() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);

        escrow_client.defund_escrow(&token_id, &device_hash, &200);

        let balance = escrow_client.balance_of(&device_hash);
        assert_eq!(balance, 300);
    }

    #[test]
    #[should_panic]
    fn test_authorize_unauthorized_agent_fails() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let stranger = random_address(&env);
        let merchant = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        agent_registry::Client::new(&env, &agent_registry_id)
            .register_agent(&wallet, &device_hash, &agent);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);

        escrow_client.authorize(&stranger, &device_hash, &merchant, &200);
    }

    #[test]
    #[should_panic]
    fn test_authorize_insufficient_balance_fails() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let merchant = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        agent_registry::Client::new(&env, &agent_registry_id)
            .register_agent(&wallet, &device_hash, &agent);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &100);

        escrow_client.authorize(&agent, &device_hash, &merchant, &200);
    }
}
