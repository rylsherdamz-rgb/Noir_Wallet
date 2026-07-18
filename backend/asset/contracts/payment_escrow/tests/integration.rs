#[cfg(test)]
mod tests {
    use payment_escrow::PaymentEscrow;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{token, Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    fn deploy_agent_registry(env: &Env, admin: &Address) -> Address {
        let contract_id = env.register(agent_registry::AgentRegistry, ());
        agent_registry::Client::new(env, &contract_id).initialize(admin);
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

        assert_eq!(escrow_client.balance_of(&device_hash), 500);
    }

    #[test]
    fn test_register_agent_and_authorize() {
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

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.register_agent(&wallet, &device_hash, &agent);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);
        escrow_client.authorize(&agent, &device_hash, &merchant, &200);

        assert_eq!(escrow_client.balance_of(&device_hash), 300);
        assert_eq!(escrow_client.pending_balance(&merchant), 200);
    }

    #[test]
    fn test_claim_payments() {
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

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.register_agent(&wallet, &device_hash, &agent);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);
        escrow_client.authorize(&agent, &device_hash, &merchant, &200);
        escrow_client.authorize(&agent, &device_hash, &merchant, &150);

        assert_eq!(sac_client.balance(&merchant), 0);

        escrow_client.claim(&token_id, &merchant);

        assert_eq!(sac_client.balance(&merchant), 350);
        assert_eq!(escrow_client.pending_balance(&merchant), 0);
    }

    #[test]
    fn test_defund_escrow_returns_funds() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = random_address(&env);
        let wallet = random_address(&env);
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

        assert_eq!(escrow_client.balance_of(&device_hash), 300);
    }

    #[test]
    fn test_multi_merchant_independent_counters() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let merchant_a = random_address(&env);
        let merchant_b = random_address(&env);
        let device_hash = random_bytes_32(&env);

        let agent_registry_id = deploy_agent_registry(&env, &admin);
        let (token_id, sac_client) = create_token(&env, &admin);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.register_agent(&wallet, &device_hash, &agent);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);

        escrow_client.authorize(&agent, &device_hash, &merchant_a, &100);
        escrow_client.authorize(&agent, &device_hash, &merchant_b, &200);
        escrow_client.authorize(&agent, &device_hash, &merchant_a, &50);

        assert_eq!(escrow_client.pending_balance(&merchant_a), 150);
        assert_eq!(escrow_client.pending_balance(&merchant_b), 200);

        escrow_client.claim(&token_id, &merchant_a);
        assert_eq!(sac_client.balance(&merchant_a), 150);
        assert_eq!(escrow_client.pending_balance(&merchant_a), 0);
        assert_eq!(escrow_client.pending_balance(&merchant_b), 200);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
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

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.register_agent(&wallet, &device_hash, &agent);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &500);
        escrow_client.authorize(&stranger, &device_hash, &merchant, &200);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #2)")]
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

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.register_agent(&wallet, &device_hash, &agent);

        sac_client.mint(&wallet, &1000);
        escrow_client.fund_escrow(&token_id, &wallet, &device_hash, &100);
        escrow_client.authorize(&agent, &device_hash, &merchant, &200);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #5)")]
    fn test_claim_nothing_fails() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = random_address(&env);
        let merchant = random_address(&env);
        let (token_id, _) = create_token(&env, &admin);
        let agent_registry_id = deploy_agent_registry(&env, &admin);

        let escrow_id = env.register(PaymentEscrow, ());
        env.as_contract(&escrow_id, || {
            PaymentEscrow::initialize(env.clone(), admin.clone(), agent_registry_id);
        });

        let escrow_client = PaymentEscrowClient::new(&env, &escrow_id);
        escrow_client.claim(&token_id, &merchant);
    }
}
