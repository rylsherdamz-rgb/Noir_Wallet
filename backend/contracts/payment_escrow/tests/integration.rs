#[cfg(test)]
mod tests {
    use payment_escrow::{
        agent_registry, device_registry, PaymentEscrow, PaymentEscrowClient,
    };
    use soroban_sdk::testutils::Ledger as _;
    use soroban_sdk::{token, Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    fn deploy_agent_registry(env: &Env, admin: &Address) -> Address {
        let id = env.register(agent_registry::WASM, ());
        agent_registry::Client::new(env, &id).initialize(admin);
        id
    }

    fn deploy_device_registry(env: &Env, admin: &Address) -> Address {
        let id = env.register(device_registry::WASM, ());
        device_registry::Client::new(env, &id).initialize(admin);
        id
    }

    fn create_token<'a>(env: &'a Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let sac_client = token::StellarAssetClient::new(env, &sac.address());
        (sac.address(), sac_client)
    }

    /// Full wiring: device_registry, agent_registry, token, escrow, a registered
    /// device + an authorized agent policy, and a funded escrow.
    struct Fixture<'a> {
        escrow: PaymentEscrowClient<'a>,
        token_id: Address,
        sac: token::StellarAssetClient<'a>,
        agent_registry_id: Address,
        wallet: Address,
        agent: Address,
        device_hash: BytesN<32>,
    }

    fn setup(env: &Env, max_amount: i128, expires_at: u64) -> Fixture<'_> {
        let admin = random_address(env);
        let wallet = random_address(env);
        let agent = random_address(env);
        let device_hash = random_bytes_32(env);

        let agent_registry_id = deploy_agent_registry(env, &admin);
        let device_registry_id = deploy_device_registry(env, &admin);
        let (token_id, sac) = create_token(env, &admin);

        // Register the device so device_registry.get_owner resolves to the wallet.
        device_registry::Client::new(env, &device_registry_id)
            .register(&wallet, &device_hash, &agent);

        // Authorize the agent under a constrained policy bound to the token.
        agent_registry::Client::new(env, &agent_registry_id)
            .register_agent(&wallet, &device_hash, &agent, &max_amount, &token_id, &expires_at);

        let escrow_id = env.register(PaymentEscrow, ());
        let escrow = PaymentEscrowClient::new(env, &escrow_id);
        escrow.initialize(&admin, &agent_registry_id, &device_registry_id);

        sac.mint(&wallet, &10_000);

        Fixture {
            escrow,
            token_id,
            sac,
            agent_registry_id,
            wallet,
            agent,
            device_hash,
        }
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        f.escrow
            .initialize(&random_address(&env), &f.agent_registry_id, &f.agent_registry_id);
    }

    #[test]
    fn test_balance_of_unfunded_is_zero() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        // Never funded -> defaults to 0, no panic.
        assert_eq!(f.escrow.balance_of(&f.device_hash), 0);
        assert_eq!(f.escrow.balance_of(&random_bytes_32(&env)), 0);
    }

    #[test]
    fn test_fund_escrow_increases_balance() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        assert_eq!(f.escrow.balance_of(&f.device_hash), 500);
    }

    #[test]
    fn test_authorize_in_policy_payment() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &200, &1);

        assert_eq!(f.escrow.balance_of(&f.device_hash), 300);
        assert_eq!(f.escrow.pending_balance(&merchant), 200);
    }

    #[test]
    fn test_claim_payments() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &200, &1);
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &150, &2);

        f.escrow.claim(&f.token_id, &merchant);
        assert_eq!(f.sac.balance(&merchant), 350);
        assert_eq!(f.escrow.pending_balance(&merchant), 0);
    }

    #[test]
    fn test_defund_escrow_returns_funds() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        f.escrow.defund_escrow(&f.token_id, &f.device_hash, &200);
        assert_eq!(f.escrow.balance_of(&f.device_hash), 300);
    }

    // ---------------- Negative paths (SOW security validation) ----------------

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_unauthorized_agent_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let stranger = random_address(&env);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        f.escrow
            .authorize(&stranger, &f.device_hash, &merchant, &f.token_id, &200, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_over_limit_payment_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0); // cap = 1000
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &5000);
        // 1001 exceeds the policy cap of 1000 -> AgentNotAuthorized.
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &1001, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_wrong_asset_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);
        let (other_token, _) = create_token(&env, &f.wallet);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        // Policy is bound to f.token_id; paying with other_token is rejected.
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &other_token, &200, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_expired_authorization_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1000);
        let f = setup(&env, 1000, 2000); // expires at 2000
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        env.ledger().set_timestamp(2001); // past expiry
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &200, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #6)")]
    fn test_replayed_nonce_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &100, &1);
        // Reusing nonce 1 (<= last) is a replay -> DuplicateAuth.
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &100, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #8)")]
    fn test_fund_unregistered_device_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        // Funds for a hash device_registry does not know could never be
        // withdrawn or swept (both resolve the owner there) — refuse them.
        f.escrow
            .fund_escrow(&f.token_id, &f.wallet, &random_bytes_32(&env), &500);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #2)")]
    fn test_insufficient_balance_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &100);
        // In-policy (<=1000) but escrow only has 100.
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &200, &1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #5)")]
    fn test_claim_nothing_fails() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);
        f.escrow.claim(&f.token_id, &merchant);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_revoked_agent_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);
        let merchant = random_address(&env);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &500);
        // Revoke the agent; a subsequent authorize must be rejected.
        agent_registry::Client::new(&env, &f.agent_registry_id)
            .revoke_agent(&f.wallet, &f.device_hash);
        f.escrow
            .authorize(&f.agent, &f.device_hash, &merchant, &f.token_id, &100, &1);
    }

    // ---------------- Sweep on revoke ----------------

    #[test]
    fn test_sweep_on_revoke_returns_all_funds_to_owner() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &700);
        let owner_before = f.sac.balance(&f.wallet);

        // Owner revokes the agent, then sweeps the escrow back to themselves.
        agent_registry::Client::new(&env, &f.agent_registry_id)
            .revoke_agent(&f.wallet, &f.device_hash);
        let swept = f.escrow.sweep_on_revoke(&f.token_id, &f.device_hash, &f.agent);

        assert_eq!(swept, 700);
        assert_eq!(f.escrow.balance_of(&f.device_hash), 0);
        assert_eq!(f.sac.balance(&f.wallet), owner_before + 700);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #7)")]
    fn test_sweep_rejected_while_agent_active() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);

        f.escrow.fund_escrow(&f.token_id, &f.wallet, &f.device_hash, &700);
        // Agent is still authorized -> sweep must be refused (AgentStillActive).
        f.escrow.sweep_on_revoke(&f.token_id, &f.device_hash, &f.agent);
    }

    #[test]
    fn test_sweep_on_empty_escrow_is_noop() {
        let env = Env::default();
        env.mock_all_auths();
        let f = setup(&env, 1000, 0);

        agent_registry::Client::new(&env, &f.agent_registry_id)
            .revoke_agent(&f.wallet, &f.device_hash);
        let swept = f.escrow.sweep_on_revoke(&f.token_id, &f.device_hash, &f.agent);
        assert_eq!(swept, 0);
    }
}
