#[cfg(test)]
mod tests {
    use agent_registry::{AgentRegistry, AgentRegistryClient};
    use soroban_sdk::testutils::Ledger as _;
    use soroban_sdk::{Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    /// Deploy an initialized registry and return a client bound to it.
    fn deploy(env: &Env) -> (AgentRegistryClient<'_>, Address) {
        let contract_id = env.register(AgentRegistry, ());
        let client = AgentRegistryClient::new(env, &contract_id);
        let admin = random_address(env);
        client.initialize(&admin);
        (client, contract_id)
    }

    #[test]
    fn test_initialize_happy_path() {
        let env = Env::default();
        env.mock_all_auths();
        deploy(&env);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);
        client.initialize(&random_address(&env));
    }

    #[test]
    fn test_register_and_get_agent_roundtrip() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        // max_amount = 1000, never expires.
        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);

        assert_eq!(client.get_agent(&device_hash), agent);

        let policy = client.get_policy(&device_hash);
        assert_eq!(policy.agent, agent);
        assert_eq!(policy.max_amount, 1000);
        assert_eq!(policy.asset, asset);
        assert_eq!(policy.expires_at, 0);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_duplicate_registration_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #4)")]
    fn test_register_with_past_expiry_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1000);
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        // expires_at (500) already in the past relative to ledger time (1000).
        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &500);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #4)")]
    fn test_register_with_negative_max_amount_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &-1, &asset, &0);
    }

    #[test]
    fn test_is_auth_true_for_authorized_agent() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(client.is_auth(&device_hash, &agent));
    }

    #[test]
    fn test_is_auth_false_for_stranger() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let stranger = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(!client.is_auth(&device_hash, &stranger));
    }

    #[test]
    fn test_is_auth_false_after_expiry() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1000);
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        // Expires at 2000.
        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &2000);
        assert!(client.is_auth(&device_hash, &agent));

        // Advance past expiry.
        env.ledger().set_timestamp(2001);
        assert!(!client.is_auth(&device_hash, &agent));
    }

    #[test]
    fn test_revoke_removes_authorization() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        client.revoke_agent(&wallet, &device_hash);
        assert!(!client.is_auth(&device_hash, &agent));
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #2)")]
    fn test_revoke_unknown_device_panics() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);
        let wallet = random_address(&env);
        client.revoke_agent(&wallet, &random_bytes_32(&env));
    }

    // ---- check_payment: the single enforcement predicate ----

    #[test]
    fn test_check_payment_accepts_in_policy() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(client.check_payment(&device_hash, &agent, &asset, &500));
        assert!(client.check_payment(&device_hash, &agent, &asset, &1000)); // at the cap
    }

    #[test]
    fn test_check_payment_rejects_over_limit() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(!client.check_payment(&device_hash, &agent, &asset, &1001));
    }

    #[test]
    fn test_check_payment_rejects_wrong_asset() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let other_asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(!client.check_payment(&device_hash, &agent, &other_asset, &500));
    }

    #[test]
    fn test_check_payment_rejects_nonpositive_amount() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &0);
        assert!(!client.check_payment(&device_hash, &agent, &asset, &0));
        assert!(!client.check_payment(&device_hash, &agent, &asset, &-5));
    }

    #[test]
    fn test_check_payment_uncapped_when_max_zero() {
        let env = Env::default();
        env.mock_all_auths();
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        // max_amount 0 = uncapped.
        client.register_agent(&wallet, &device_hash, &agent, &0, &asset, &0);
        assert!(client.check_payment(&device_hash, &agent, &asset, &i128::MAX));
    }

    #[test]
    fn test_check_payment_rejects_after_expiry() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1000);
        let (client, _) = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let asset = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register_agent(&wallet, &device_hash, &agent, &1000, &asset, &2000);
        assert!(client.check_payment(&device_hash, &agent, &asset, &500));

        env.ledger().set_timestamp(2001);
        assert!(!client.check_payment(&device_hash, &agent, &asset, &500));
    }
}
