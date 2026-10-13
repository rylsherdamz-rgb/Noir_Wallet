import { DocPage } from '@/components/DocPage'
import { CodeBlock } from '@/components/CodeBlock'
import { docMetadata } from '@/lib/docs'
import { CONTRACTS, REPO, explorer } from '@/lib/site'

export const metadata = docMetadata('contracts')

const FUNCTIONS: Record<string, [string, string][]> = {
  device_registry: [
    ['register(wallet, device_hash, agent)', 'wallet'],
    ['revoke(wallet, device_hash)', 'wallet'],
    ['get_owner(device_hash) → Address', 'read'],
    ['get_device(device_hash) → DeviceInfo', 'read'],
    ['wallet_device_count(wallet) → u32', 'read'],
    ['wallet_device_at(wallet, index) → BytesN<32>', 'read'],
  ],
  agent_registry: [
    ['register_agent(wallet, device_hash, agent, max_amount, asset, expires_at)', 'wallet'],
    ['revoke_agent(wallet, device_hash)', 'wallet'],
    ['get_policy(device_hash) → AgentPolicy', 'read'],
    ['is_auth(device_hash, agent) → bool', 'read'],
    ['check_payment(device_hash, agent, asset, amount) → bool', 'read'],
  ],
  payment_escrow: [
    ['fund_escrow(token, wallet, device_hash, amount)', 'wallet'],
    ['authorize(agent, device_hash, merchant, asset, amount, nonce)', 'agent'],
    ['claim(token, merchant)', 'merchant'],
    ['defund_escrow(token, device_hash, amount)', 'device owner'],
    ['sweep_on_revoke(token, device_hash, agent) → i128', 'device owner'],
    ['balance_of(device_hash) → i128', 'read'],
    ['pending_balance(merchant) → i128', 'read'],
  ],
}

const ERRORS: Record<string, string> = {
  device_registry: '1 AlreadyInitialized · 2 DeviceNotFound · 3 NotOwner · 4 AlreadyRegistered',
  agent_registry: '1 AlreadyInitialized · 2 AgentNotFound · 3 AlreadyRegistered · 4 InvalidPolicy',
  payment_escrow: '1 AlreadyInitialized · 2 InsufficientBalance · 3 AgentNotAuthorized · 4 NotDeviceOwner · 5 NothingToClaim · 6 DuplicateAuth · 7 AgentStillActive · 8 DeviceNotRegistered',
}

export default function Contracts() {
  return (
    <DocPage slug="contracts">
      <h2 id="ids">Stellar Testnet deployment</h2>
      <div className="table-wrap"><table className="doc-table">
        <thead><tr><th>Contract</th><th>ID</th></tr></thead>
        <tbody>{CONTRACTS.map((c) => (
          <tr key={c.name}><td><code>{c.name}</code></td><td><a className="mono break" href={explorer(c.id)} target="_blank" rel="noopener">{c.id}</a></td></tr>
        ))}</tbody>
      </table></div>
      <p>RPC <code>https://soroban-testnet.stellar.org</code> · passphrase <code>Test SDF Network ; September 2015</code>. Every redeploy mints new IDs; the SDK’s <code>TESTNET</code> constant and <code>GET /v1/network</code> always carry the current ones.</p>

      <h2 id="order">Call order</h2>
      <ol className="doc-list doc-steps">
        <li><code>device_registry.register</code> — owner binds the card hash.</li>
        <li><code>agent_registry.register_agent</code> — owner sets the policy.</li>
        <li><code>payment_escrow.fund_escrow</code> — owner pre-funds the card.</li>
        <li><code>payment_escrow.authorize</code> — on tap, the agent pays the merchant.</li>
        <li><code>payment_escrow.claim</code> — the merchant collects in batch.</li>
        <li>To unlink: <code>revoke_agent</code>, then <code>sweep_on_revoke</code> returns the escrow. Never <code>device_registry.revoke</code> while escrow is above zero — it strands funds.</li>
      </ol>

      {CONTRACTS.map((c) => (
        <section key={c.name}>
          <h2 id={c.name}><code>{c.name}</code></h2>
          <p>{c.role}</p>
          <div className="table-wrap"><table className="doc-table">
            <thead><tr><th>Function</th><th>Auth</th></tr></thead>
            <tbody>{FUNCTIONS[c.name].map(([f, a]) => <tr key={f}><td><code>{f}</code></td><td>{a}</td></tr>)}</tbody>
          </table></div>
          <p className="doc-errors"><b>Errors:</b> {ERRORS[c.name]}</p>
        </section>
      ))}

      <h2 id="cli">From the Stellar CLI</h2>
      <CodeBlock lang="bash" code={`
stellar contract invoke --network testnet --source alice \\
  --id ${CONTRACTS[1].id} -- \\
  get_policy --device_hash ab12…   # 64 hex chars
`} />
      <p>Rust source and tests: <a href={`${REPO}/tree/main/backend/contracts`} target="_blank" rel="noopener">backend/contracts</a>.</p>
    </DocPage>
  )
}
