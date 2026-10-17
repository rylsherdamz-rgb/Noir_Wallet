# Smart Contract Reference

The three Soroban contracts in [`backend/contracts/`](../backend/contracts/). This page is the public interface reference: every function, argument, error code, event and storage key, taken from the Rust source. If this page and the source ever disagree, the source wins.

| Contract | Source | Tests | Testnet ID (2026-10-07 deploy) |
|----------|--------|-------|--------------------------------|
| `device_registry` | [`device_registry/src/lib.rs`](../backend/contracts/device_registry/src/lib.rs) | 10 | [`CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA`](https://stellar.expert/explorer/testnet/contract/CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA) |
| `agent_registry` | [`agent_registry/src/lib.rs`](../backend/contracts/agent_registry/src/lib.rs) | 17 | [`CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ`](https://stellar.expert/explorer/testnet/contract/CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ) |
| `payment_escrow` | [`payment_escrow/src/lib.rs`](../backend/contracts/payment_escrow/src/lib.rs) | 18 | [`CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX`](https://stellar.expert/explorer/testnet/contract/CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX) |

WASM hashes and deploy transactions: [`deploy-evidence/deploy-testnet-20261007T050558Z.md`](../deploy-evidence/deploy-testnet-20261007T050558Z.md).

> [!NOTE]
> The `fund_escrow` registration check (`DeviceNotRegistered = 8`) is in the source and tested, but **not yet redeployed**. The live Testnet `payment_escrow` still accepts a deposit for an unregistered device; the app refuses it client-side. See [the to-do list](README.md#still-to-do).

## Conventions

- **`device_hash: BytesN<32>`** is `SHA-256(tag UID string)`, computed off-chain (see [NFC hardware](nfc-hardware.md#how-a-tag-becomes-a-device_hash)). The raw UID never goes on-chain.
- **Amounts are `i128` in stroops** of the token contract (1 XLM = 10,000,000 stroops). Token arguments are Stellar Asset Contract (SAC) addresses; for native XLM on Testnet use `stellar contract id asset --asset native --network testnet`.
- **Auth.** Every state-changing call starts with `require_auth()` on the party whose consent it needs. The app never enforces authorization on its own.
- **Errors** reach clients as `Error(Contract, #N)`. The app maps them to user-facing text in [`frontend/src/domain/contractErrors.ts`](../frontend/src/domain/contractErrors.ts).
- **Storage.** All state is `persistent`, except pending merchant payments, which are `temporary`.

---

## device_registry

Maps a hashed NFC device to its owner wallet and agent, and keeps a dense per-wallet index of devices.

### Types

```rust
pub struct DeviceInfo {
    pub owner: Address,
    pub agent: Address,
    pub status: u32,      // 0 = active
    pub created_at: u64,  // ledger timestamp at registration
}

enum DataKey { Admin, WalletDeviceCount(Address), WalletDeviceByIndex(Address, u32), Device(BytesN<32>) }
```

### Functions

| Function | Auth | Behaviour | Errors |
|----------|------|-----------|--------|
| `initialize(admin: Address)` | `admin` | Stores the admin once. | `AlreadyInitialized` |
| `register(wallet: Address, device_hash: BytesN<32>, agent: Address)` | `wallet` | Records `DeviceInfo { owner: wallet, agent, status: 0 }` and appends the hash to the wallet's index. Emits `register`. | `AlreadyRegistered` |
| `revoke(wallet: Address, device_hash: BytesN<32>)` | `wallet` | Deletes the device entry and compacts the wallet index, so the tag can be registered again. Emits `revoke`. | `DeviceNotFound`, `NotOwner` |
| `get_device(device_hash) -> DeviceInfo` | — | Read the full record. | `DeviceNotFound` |
| `get_owner(device_hash) -> Address` | — | Owner wallet. Used by `payment_escrow` for defund, sweep and the fund check. | `DeviceNotFound` |
| `get_agent(device_hash) -> Address` | — | Agent recorded at registration. | `DeviceNotFound` |
| `is_authorized(device_hash, agent) -> bool` | — | `true` if `agent` matches and `status == 0`; `false` for unknown devices. | — |
| `wallet_device_count(wallet) -> u32` | — | Number of devices owned by `wallet`. | — |
| `wallet_device_at(wallet, index: u32) -> BytesN<32>` | — | Device hash at `index` (0-based). | `DeviceNotFound` |

### Errors

| Code | Name | When |
|------|------|------|
| 1 | `AlreadyInitialized` | `initialize` called twice |
| 2 | `DeviceNotFound` | Unknown `device_hash` |
| 3 | `NotOwner` | `revoke` by a wallet that does not own the device |
| 4 | `AlreadyRegistered` | `register` for a hash that already exists (duplicate registration) |

### Events

| Topics | Data |
|--------|------|
| `("register", device_hash)` | `agent: Address` |
| `("revoke", device_hash)` | — |

---

## agent_registry

Holds the **constrained delegated-payment policy** for each device. `check_payment` is the single predicate `payment_escrow` trusts.

### Types

```rust
pub struct AgentPolicy {
    pub agent: Address,     // the authorized signing key
    pub max_amount: i128,   // per-payment cap; 0 = uncapped
    pub asset: Address,     // the only token the agent may spend
    pub expires_at: u64,    // absolute ledger timestamp; 0 = never expires
}

enum DataKey { Admin, AgentMap(BytesN<32>) }
```

### Functions

| Function | Auth | Behaviour | Errors |
|----------|------|-----------|--------|
| `initialize(admin: Address)` | `admin` | Stores the admin once. | `AlreadyInitialized` |
| `register_agent(wallet, device_hash, agent, max_amount: i128, asset: Address, expires_at: u64)` | `wallet` | Stores the policy. Rejects `max_amount < 0` and a non-zero `expires_at` that is not in the future. Emits `agent_reg`. | `InvalidPolicy`, `AlreadyRegistered` |
| `revoke_agent(wallet, device_hash)` | `wallet` | Deletes the policy. After this, `is_auth` and `check_payment` return `false`. Emits `agent_rev`. | `AgentNotFound` |
| `get_policy(device_hash) -> AgentPolicy` | — | Read the full policy. | `AgentNotFound` |
| `get_agent(device_hash) -> Address` | — | `get_policy(..).agent`. | `AgentNotFound` |
| `is_auth(device_hash, agent) -> bool` | — | `agent` matches **and** not expired. | — |
| `check_payment(device_hash, agent, asset, amount: i128) -> bool` | — | `agent` matches **and** `asset` matches **and** `amount > 0` **and** (`max_amount == 0` or `amount <= max_amount`) **and** not expired. | — |

Expiry: a policy is expired when `expires_at != 0 && ledger.timestamp() > expires_at`.

> `revoke_agent` checks `wallet.require_auth()` but does not compare `wallet` to the device owner. Only the policy is removed, and funds stay protected: `sweep_on_revoke` and `defund_escrow` always pay the owner from `device_registry`. Tighten this if you extend the contract.

### Errors

| Code | Name | When |
|------|------|------|
| 1 | `AlreadyInitialized` | `initialize` called twice |
| 2 | `AgentNotFound` | No policy for `device_hash` |
| 3 | `AlreadyRegistered` | A policy already exists for `device_hash` (revoke first) |
| 4 | `InvalidPolicy` | Negative `max_amount`, or `expires_at` already in the past |

### Events

| Topics | Data |
|--------|------|
| `("agent_reg", device_hash)` | `agent: Address` |
| `("agent_rev", device_hash)` | — |

---

## payment_escrow

Holds a pre-funded balance per device, authorizes in-policy payments with nonce replay protection, batch-settles to merchants, and returns funds to the owner. It calls the other two contracts through `contractimport!`, so they must be built first ([build order](deployment.md#1-build)).

### Types

```rust
pub struct Payment { pub device_hash: BytesN<32>, pub amount: i128, pub timestamp: u64 }

enum DataKey {
    Admin, AgentRegistry, DeviceRegistry,
    EscrowBalance(BytesN<32>),               // persistent
    PendingIndex(Address),                   // persistent, per merchant
    PendingPayment((Address, u32)),          // temporary, per merchant + index
    AuthNonce((BytesN<32>, Address)),        // persistent, per device + agent
}
```

### Functions

| Function | Auth | Behaviour | Errors |
|----------|------|-----------|--------|
| `initialize(admin, agent_registry_id: Address, device_registry_id: Address)` | `admin` | Stores the admin and both registry IDs once. | `AlreadyInitialized` |
| `fund_escrow(token, wallet, device_hash, amount: i128)` | `wallet` | Requires `device_registry.get_owner(device_hash)` to succeed, transfers `amount` from `wallet` into the contract, credits the device balance. Emits `fund`. | `DeviceNotRegistered`¹ |
| `authorize(agent, device_hash, merchant, asset, amount: i128, nonce: u64)` | `agent` | 1. `nonce > last_nonce(device, agent)` or `DuplicateAuth`; stores the nonce. 2. `agent_registry.check_payment(...)` or `AgentNotAuthorized`. 3. Balance `>= amount` or `InsufficientBalance`. Deducts the balance and records a pending `Payment` for `merchant`. Emits `authorize`. | `DuplicateAuth`, `AgentNotAuthorized`, `InsufficientBalance` |
| `claim(token, merchant)` | `merchant` | Sums all pending payments for `merchant`, clears them, and transfers the total in one token transfer. Emits `claim`. | `NothingToClaim` |
| `defund_escrow(token, device_hash, amount: i128)` | device owner | Owner (resolved from `device_registry`) withdraws part of the balance. Emits `defund`. | `InsufficientBalance` |
| `sweep_on_revoke(token, device_hash, agent) -> i128` | device owner | Refuses while `agent_registry.is_auth(device_hash, agent)` is true. Otherwise transfers the **entire** balance to the owner and returns it; returns `0` on an empty escrow. Emits `sweep` when it moves funds. | `AgentStillActive` |
| `balance_of(device_hash) -> i128` | — | Current escrow balance. | — |
| `pending_balance(merchant) -> i128` | — | Sum of pending, unclaimed payments for `merchant`. | — |

¹ Not live on the current Testnet deploy; see the note at the top.

### Errors

| Code | Name | When |
|------|------|------|
| 1 | `AlreadyInitialized` | `initialize` called twice |
| 2 | `InsufficientBalance` | `authorize` or `defund_escrow` for more than the device balance |
| 3 | `AgentNotAuthorized` | `check_payment` failed: wrong or revoked agent, wrong asset, `amount <= 0`, over the cap, or expired |
| 4 | `NotDeviceOwner` | Registry ID missing (contract not initialized) |
| 5 | `NothingToClaim` | `claim` with no pending payments |
| 6 | `DuplicateAuth` | `authorize` nonce not strictly greater than the last one (replay) |
| 7 | `AgentStillActive` | `sweep_on_revoke` while the agent is still authorized |
| 8 | `DeviceNotRegistered` | `fund_escrow` for a device `device_registry` does not know |

### Events

| Topics | Data |
|--------|------|
| `("fund", device_hash)` | `amount: i128` |
| `("authorize", device_hash, merchant)` | `amount: i128` |
| `("claim", merchant)` | `total: i128` |
| `("defund", device_hash)` | `amount: i128` |
| `("sweep", device_hash)` | `balance: i128` |

---

## Call order

```
device_registry.register          (owner signs)
agent_registry.register_agent     (owner signs; sets cap / asset / expiry)
payment_escrow.fund_escrow        (owner signs)
  ── tap ──
payment_escrow.authorize          (agent signs; nonce + policy + balance)
payment_escrow.claim              (merchant signs; batch settlement)

Unlink safely:
agent_registry.revoke_agent → payment_escrow.sweep_on_revoke → device_registry.revoke
```

> [!WARNING]
> Never call `device_registry.revoke` while the escrow balance is above zero. `defund_escrow` and `sweep_on_revoke` resolve the owner through `device_registry`, so revoking the device first strands the funds. The app's `x402.unlinkDevice` runs the safe order shown above.

## Invoking with the Stellar CLI

```bash
# Read a policy (simulation only, no fee)
stellar contract invoke --id CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ \
  --source <identity> --network testnet --send=no -- \
  get_policy --device_hash <64-hex-char hash>

# Check whether a payment would pass (amount in stroops)
stellar contract invoke --id CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ \
  --source <identity> --network testnet --send=no -- \
  check_payment --device_hash <hash> --agent <G…> --asset <SAC C…> --amount 10000000

# Escrow balance
stellar contract invoke --id CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX \
  --source <identity> --network testnet --send=no -- \
  balance_of --device_hash <hash>
```

Related: [Architecture](architecture.md) · [API reference](api-reference.md) · [Testing](testing.md)
