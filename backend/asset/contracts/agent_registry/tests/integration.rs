#[cfg(test)]
mod tests {
    use agent_registry::AgentRegistry;
    use soroban_sdk::{Address, BytesN, Env};

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

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
        });
    }

    #[test]
    #[should_panic]
    fn test_initialize_double_init_guard() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin.clone());
            AgentRegistry::initialize(env.clone(), random_address(&env));
        });
    }

    #[test]
    fn test_register_and_get_agent_roundtrip() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
            AgentRegistry::register_agent(env.clone(), wallet, device_hash.clone(), agent.clone());

            let retrieved = AgentRegistry::get_agent(env.clone(), device_hash.clone());
            assert_eq!(retrieved, agent);
        });
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_register_rejected() {
        let env = Env::default();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            env.mock_auths(&[]);
            AgentRegistry::initialize(env.clone(), admin);

            AgentRegistry::register_agent(env.clone(), wallet, device_hash, agent);
        });
    }

    #[test]
    fn test_is_auth_returns_true_for_authorized_agent() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
            AgentRegistry::register_agent(env.clone(), wallet, device_hash.clone(), agent.clone());

            let result = AgentRegistry::is_auth(env.clone(), device_hash, agent);
            assert!(result);
        });
    }

    #[test]
    fn test_is_auth_returns_false_for_unauthorized_agent() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let stranger = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
            AgentRegistry::register_agent(env.clone(), wallet, device_hash.clone(), agent);

            let result = AgentRegistry::is_auth(env.clone(), device_hash, stranger);
            assert!(!result);
        });
    }

    #[test]
    fn test_revoke_agent_removes_mapping() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let wallet = random_address(&env);
        let agent = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
            AgentRegistry::register_agent(env.clone(), wallet.clone(), device_hash.clone(), agent);
            AgentRegistry::revoke_agent(env.clone(), wallet, device_hash.clone());

            let result = AgentRegistry::is_auth(env.clone(), device_hash, agent);
            assert!(!result);
        });
    }

    #[test]
    #[should_panic]
    fn test_get_agent_unknown_hash_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(AgentRegistry, ());
        let admin = random_address(&env);
        let device_hash = random_bytes_32(&env);

        env.as_contract(&contract_id, || {
            AgentRegistry::initialize(env.clone(), admin);
            AgentRegistry::get_agent(env.clone(), device_hash);
        });
    }
}
