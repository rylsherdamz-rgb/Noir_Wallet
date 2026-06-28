#[cfg(test)]
mod tests {
    use device_registry::DeviceRegistry;
    use soroban_sdk::{Address, BytesN, Env};

    fn random_address(env: &Env) -> Address {
        <Address as soroban_sdk::testutils::Address>::generate(env)
    }

    fn random_bytes_32(env: &Env) -> BytesN<32> {
        <BytesN<32> as soroban_sdk::testutils::BytesN<32>>::random(env)
    }

    fn mock_auth_for(env: &Env, _addr: &Address) {
        env.mock_all_auths();
    }

    #[test]
    fn test_initialize_happy_path() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            // This should not panic
            DeviceRegistry::initialize(env.clone(), admin);
        });
    }

    #[test]
    #[should_panic(expected = "already")]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin);
            DeviceRegistry::initialize(env.clone(), random_address(&env));
        });
    }

    #[test]
    fn test_register_and_get_wallet_roundtrip() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());

            mock_auth_for(&env, &admin);
            DeviceRegistry::register(env.clone(), device_hash.clone(), wallet.clone());

            let retrieved_wallet = DeviceRegistry::get_wallet(env.clone(), device_hash.clone());
            assert_eq!(retrieved_wallet, wallet);
        });
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_register_rejected() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);
        let unauthorized_user = random_address(&env);
        let wallet = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin);

            mock_auth_for(&env, &unauthorized_user);
            DeviceRegistry::register(env.clone(), device_hash, wallet);
        });
    }

    #[test]
    #[should_panic]
    fn test_unregister_removes_mapping() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin.clone());

            mock_auth_for(&env, &admin);
            DeviceRegistry::register(env.clone(), device_hash.clone(), wallet);
            DeviceRegistry::unregister(env.clone(), device_hash.clone());

            // This should panic because device was unregistered
            DeviceRegistry::get_wallet(env.clone(), device_hash);
        });
    }

    #[test]
    #[should_panic]
    fn test_get_wallet_unknown_hash_panics() {
        let env = Env::default();
        let contract_id = random_address(&env);
        let admin = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            DeviceRegistry::initialize(env.clone(), admin);

            DeviceRegistry::get_wallet(env.clone(), device_hash);
        });
    }
}
