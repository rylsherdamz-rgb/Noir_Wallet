#[cfg(test)]
mod tests {
    use device_registry::{DeviceRegistry, DeviceRegistryClient};
    use soroban_sdk::{Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    /// Deploy an initialized registry and return a client bound to it.
    ///
    /// The client pattern matters: every client call is its own invocation
    /// frame, so `mock_all_auths` applies per-call. Calling the contract methods
    /// directly inside a single `env.as_contract` closure instead collapses them
    /// into one frame and a second `require_auth` for the same address trips
    /// `Error(Auth, ExistingValue)` ("frame is already authorized").
    fn deploy(env: &Env) -> DeviceRegistryClient<'_> {
        let contract_id = env.register(DeviceRegistry, ());
        let client = DeviceRegistryClient::new(env, &contract_id);
        client.initialize(&random_address(env));
        client
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
        let client = deploy(&env);
        client.initialize(&random_address(&env));
    }

    #[test]
    fn test_register_maps_device() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);

        assert!(client.is_authorized(&device_hash, &agent));
        assert_eq!(client.wallet_device_count(&wallet), 1);
        assert_eq!(client.wallet_device_at(&wallet, &0), device_hash);
        assert_eq!(client.get_owner(&device_hash), wallet);
        assert_eq!(client.get_agent(&device_hash), agent);
        let info = client.get_device(&device_hash);
        assert_eq!(info.owner, wallet);
        assert_eq!(info.agent, agent);
        assert_eq!(info.status, 0);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_register_rejected() {
        let env = Env::default();
        let contract_id = env.register(DeviceRegistry, ());
        let client = DeviceRegistryClient::new(&env, &contract_id);

        env.mock_all_auths();
        client.initialize(&random_address(&env));

        // No auth mocked for register -> require_auth panics.
        env.set_auths(&[]);
        client.register(&random_address(&env), &random_bytes_32(&env), &random_address(&env));
    }

    #[test]
    fn test_revoke_removes_entry_enabling_re_registration() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);
        client.revoke(&wallet, &device_hash);

        // Deauthorized since the entry no longer exists.
        assert!(!client.is_authorized(&device_hash, &agent));
        // Wallet listing compacted back to zero.
        assert_eq!(client.wallet_device_count(&wallet), 0);

        // Re-registering must now succeed (previously it panicked AlreadyRegistered).
        client.register(&wallet, &device_hash, &agent);
        assert!(client.is_authorized(&device_hash, &agent));
        assert_eq!(client.wallet_device_count(&wallet), 1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #2)")]
    fn test_get_device_after_revoke_panics() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);
        client.revoke(&wallet, &device_hash);

        // Device fully gone: get_device panics DeviceNotFound (#2).
        client.get_device(&device_hash);
    }

    #[test]
    fn test_revoke_only_removes_owned_device() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);
        let other_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);
        client.register(&wallet, &other_hash, &agent);

        client.revoke(&wallet, &device_hash);

        // First device gone, second still present and slot shifted.
        assert_eq!(client.wallet_device_count(&wallet), 1);
        assert_eq!(client.wallet_device_at(&wallet, &0), other_hash);
        assert!(client.is_authorized(&other_hash, &agent));
    }

    #[test]
    fn test_is_authorized_false_for_wrong_agent() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let agent = random_address(&env);
        let other_agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);

        // Device exists and is active, but the queried agent is not the mapped
        // one -> is_authorized must return false (not panic).
        assert!(client.is_authorized(&device_hash, &agent));
        assert!(!client.is_authorized(&device_hash, &other_agent));
    }

    #[test]
    fn test_is_authorized_false_for_unknown_device() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        // Never-registered device -> false, not panic.
        assert!(!client.is_authorized(&random_bytes_32(&env), &random_address(&env)));
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_revoke_non_owner_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let client = deploy(&env);

        let wallet = random_address(&env);
        let other = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        client.register(&wallet, &device_hash, &agent);
        // Non-owner revoke must panic NotOwner (#3).
        client.revoke(&other, &device_hash);
    }
}
