#[cfg(test)]
mod tests {
    use device_registry::{DeviceInfo, DeviceRegistry};
    use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    #[test]
    fn test_initialize_happy_path() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin);
        });
    }

    #[test]
    #[should_panic]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());
            DeviceRegistry::initialize(env.clone(), random_address(&env));
        });
    }

    #[test]
    fn test_register_revoked_mapping() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent.clone());

            // Verify it was authorized immediately after registration
            assert!(DeviceRegistry::is_authorized(env.clone(), device_hash.clone(), agent.clone()));
            assert_eq!(DeviceRegistry::wallet_device_count(env.clone(), wallet.clone()), 1);
            assert_eq!(DeviceRegistry::wallet_device_at(env.clone(), wallet.clone(), 0), device_hash.clone());
        });
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_register_rejected() {
        let env = Env::default();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let device_hash = random_bytes_32(&env);
        let agent = random_address(&env);

        env.as_contract(&contract_id, || {
            // Mock auth for initialize only
            env.mock_auths(&[]);
            DeviceRegistry::initialize(env.clone(), admin.clone());
            env.mock_auths(&[]);

            // Register without auth - should panic
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent);
        });
    }

    #[test]
    fn test_revoke_removes_entry_enabling_re_registration() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent.clone());

            DeviceRegistry::revoke(env.clone(), wallet.clone(), device_hash.clone());

            // Device must be fully gone: get_device panics
            let result = std::panic::catch_unwind(|| {
                DeviceRegistry::get_device(env.clone(), device_hash.clone());
            });
            assert!(result.is_err());

            // Deauthorized since the entry no longer exists
            assert!(!DeviceRegistry::is_authorized(env.clone(), device_hash.clone(), agent.clone()));

            // Wallet listing compacted back to zero
            assert_eq!(DeviceRegistry::wallet_device_count(env.clone(), wallet.clone()), 0);

            // Re-registering must now succeed (previously it panicked AlreadyRegistered)
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent.clone());
            assert!(DeviceRegistry::is_authorized(env.clone(), device_hash.clone(), agent.clone()));
            assert_eq!(DeviceRegistry::wallet_device_count(env.clone(), wallet.clone()), 1);
        });
    }

    #[test]
    fn test_revoke_only_removes_owned_device() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let other = random_address(&env);
        let device_hash = random_bytes_32(&env);
        let other_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent.clone());
            DeviceRegistry::register(env.clone(), wallet.clone(), other_hash.clone(), agent.clone());

            DeviceRegistry::revoke(env.clone(), wallet.clone(), device_hash.clone());

            // First device gone, second still present and slot shifted
            assert_eq!(DeviceRegistry::wallet_device_count(env.clone(), wallet.clone()), 1);
            assert_eq!(DeviceRegistry::wallet_device_at(env.clone(), wallet.clone(), 0), other_hash.clone());
            assert!(DeviceRegistry::is_authorized(env.clone(), other_hash.clone(), agent.clone()));
        });
    }

    #[test]
    #[should_panic]
    fn test_revoke_non_owner_rejected() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DeviceRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let other = random_address(&env);
        let device_hash = random_bytes_32(&env);
        let agent = random_address(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());
            DeviceRegistry::register(env.clone(), wallet.clone(), device_hash.clone(), agent.clone());
            // Non-owner revoke must panic
            DeviceRegistry::revoke(env.clone(), other.clone(), device_hash.clone());
        });
    }
}