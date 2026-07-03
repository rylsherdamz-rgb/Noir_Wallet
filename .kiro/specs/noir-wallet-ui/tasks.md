# Implementation Plan: Noir Wallet UI

## Overview

This plan implements the **client app only** (mobile UI + pure client-side domain logic) for Noir Wallet, an Expo React Native (SDK 54, expo-router, TypeScript) app. All code, folders, and tests are created **inside `c:\Users\Richie\Projects\Noir\Noir`** (e.g. `app/`, `components/`, `src/`, and co-located `*.test.ts`). Nothing is written into the `Noir_Wallet` spec folder.

Per the agreed scope, **real web3/blockchain/x402 network behavior is out of scope for now**. Every chain/network/x402/agent side effect sits behind the abstracted service interfaces from the design (`ChainService`, `X402Client`, `AgentWalletService`, `Key_Manager` signing, `NfcHardwareAdapter`, `SecureStorageAdapter`) and is implemented with **mock/in-memory adapters** so the UI and pure domain logic are fully functional and testable without a blockchain. Pure client-side logic that does not need the network (BIP-39 generate/validate, phrase confirmation, SEP-0005 offline derivation, strkey/amount validation, aggregate fiat, tx history sort, agent budget arithmetic, NFC payload decode modeling, session lock logic) is fully in scope and built here.

Work is front-loaded: shared types → mock adapters → pure domain (with property tests) → stores → UI screens → integration wiring. The real Stellar/x402/NFC-hardware transport implementations are deferred as clearly-marked optional tasks at the end.

The implementation language is **TypeScript** (as specified in the design document).

## Tasks

- [ ] 1. Test tooling and shared foundation
  - [ ] 1.1 Add dev/test dependencies and configure Jest
    - Add dev deps: `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`, `@types/jest`, `fast-check`
    - Add `jest.config.js` using the `jest-expo` preset, `transformIgnorePatterns` for RN/Expo modules, and a `setupFilesAfterEnv` that installs `react-native-get-random-values` and the `buffer` polyfill for BIP-39/Stellar crypto in tests
    - Add `test`, `test:watch` npm scripts (single-run default: `jest`); do NOT enable watch mode by default
    - Verify a trivial sample test runs green before moving on
    - _Requirements: supports all (test harness)_
  - [ ] 1.2 Define shared domain types and service interfaces
    - Create `src/types/` with the design's TypeScript model + interface definitions: `WalletRecord`, `WalletKind`, `Asset`, `Transaction`, `TxDirection`, `TxStatus`, `UnsignedTransaction`, `SignedTransaction`, `PairedDevice`, `DeveloperToolsState`, `SettingsState`, `NetworkEnvironment`
    - Create `src/services/` interface files (no implementations yet): `Key_Manager`, `SecureStorageAdapter`, `AuthService`, `SessionController`, `NfcHardwareAdapter`, `NFC_Manager`, `RawTag`, `DecodedPayload`, `ScanResult`, `ChainService`, `AgentWalletService`, `AgentFunding`, `X402Client`, `PaymentTerms`, `PaymentDecision`, `X402Result`, `PhraseValidation`, `ConfirmInput`, `PhraseLength`
    - _Requirements: 1.3, 2.2, 3.1, 4.1, 5.1, 6.2, 7.1, 8.1, 9.1, 10.1_

- [ ] 2. Mock/in-memory infrastructure adapters
  - [ ] 2.1 Implement in-memory SecureStorage adapter with failure injection
    - Create `src/infra/mock/mockSecureStorage.ts` implementing `SecureStorageAdapter` over an in-memory `Map` for keys `wallet.primary`, `wallet.agent`, `onboarding.complete`
    - Add a failure-injection flag to force read/write rejections to exercise R1.6/R2.4/R3.1 error paths
    - _Requirements: 1.6, 2.4, 3.1_
  - [ ] 2.2 Implement mock biometric/Auth adapter
    - Create `src/infra/mock/mockAuthService.ts` implementing `AuthService` (`isBiometricAvailable`, `authenticate`) with scriptable success/failure and method (`biometric`/`passcode`)
    - _Requirements: 3.2, 3.3, 3.5_
  - [ ] 2.3 Implement scriptable mock NFC hardware adapter
    - Create `src/infra/mock/mockNfcHardware.ts` implementing `NfcHardwareAdapter` (`getCapability`, `startSession`, `readTag`, `writeTag`, `endSession`)
    - Support scripting: return a tag, produce an undecodable payload, time out / no-tag, cancel, capability `available`/`unavailable`/`unknown`, and throw on `endSession`
    - _Requirements: 5.1, 5.4, 5.5, 6.1, 6.2, 6.3, 6.5_
  - [ ] 2.4 Implement mock ChainService adapter
    - Create `src/infra/mock/mockChainService.ts` implementing `ChainService` with canned `getBalances` (incl. native XLM), canned `broadcast` receipts, client-side `validateAddress`, and `setEnvironment`
    - Add a failure variant for `getBalances`/`broadcast` to drive stale-data (R4.4) and broadcast-failure handling
    - _Requirements: 4.1, 4.4, 7.5, 10.4_
  - [ ] 2.5 Implement mock X402/Facilitator adapter
    - Create `src/infra/mock/mockFacilitator.ts` producing mock HTTP-402 responses and settlement outcomes: `200 OK` settle, `network` failure, and unsupported-stablecoin/unknown-scheme terms
    - _Requirements: 11.1, 12.1, 13.1, 14.1_
  - [ ] 2.6 Implement Clipboard and QR adapter wrappers
    - Create `src/infra/clipboard.ts` (wraps `expo-clipboard`) and `src/infra/qr.ts` (thin wrapper around `react-native-qrcode-svg`) exposing a testable render/copy surface with a failure path
    - _Requirements: 8.2, 8.3_

- [ ] 3. Recovery phrase and key management (pure + mock-backed)
  - [ ] 3.1 Implement generateRecoveryPhrase and validatePhrase (BIP-39)
    - Create `src/domain/phrase.ts` using `bip39`: `generateRecoveryPhrase(length: 12 | 24)` from a secure random source and `validatePhrase` returning `PhraseValidation` with `reason` (`length` | `unknown-word` | `checksum`) and `invalidWordIndexes`
    - _Requirements: 1.3, 2.2, 2.3_
  - [ ] 3.2 Implement confirmPhraseSubset
    - Add `confirmPhraseSubset(original, entered)` to `src/domain/phrase.ts`: true only when every supplied index holds the exact original word
    - _Requirements: 1.4, 1.5_
  - [ ] 3.3 Implement SEP-0005 deterministic key/address derivation (offline)
    - Create `src/domain/derivation.ts` using `stellar-hd-wallet` to derive the Ed25519 keypair and `Stellar_Account_ID` from a phrase via SEP-0005 (SLIP-0010) — pure/offline, no network
    - _Requirements: 1.3, 2.4_
  - [ ] 3.4 Implement Key_Manager (createWallet/importWallet + mock signing)
    - Create `src/domain/keyManager.ts` implementing `Key_Manager`: derive → build `WalletRecord` → encrypt (via `expo-crypto` helper) → persist through the injected `SecureStorageAdapter`; abort the flow on persist failure (no navigation on error)
    - Implement `signTransaction` / `signPaymentAuthorization` as local signing over the stored key (no broadcast); return `SignedTransaction` / `PaymentProof`
    - _Requirements: 1.6, 2.4, 7.5_
  - [ ]* 3.5 Write property test for phrase round-trip and deterministic derivation
    - **Property 1: Recovery phrase round-trip and deterministic derivation**
    - **Validates: Requirements 1.3, 2.2, 2.4**
    - fast-check, ≥100 runs; generator over length {12, 24}; assert generated phrase always validates and derivation is deterministic
  - [ ]* 3.6 Write property test for invalid-phrase rejection
    - **Property 2: Invalid phrases are always rejected and block derivation**
    - **Validates: Requirements 2.2, 2.3**
    - Generators mutate a valid phrase with an unknown word or corrupted checksum word
  - [ ]* 3.7 Write property test for confirmation-subset matching
    - **Property 3: Confirmation-subset matching**
    - **Validates: Requirements 1.4, 1.5**
    - Generate random index subsets; exact words confirm, any single mutated word rejects
  - [ ]* 3.8 Write unit tests for Key_Manager persistence and error paths
    - Cover successful persist and failure-injected persist abort (no wallet record leaked)
    - _Requirements: 1.6, 2.4_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Session lock and authentication
  - [ ] 5.1 Implement SessionController unlock logic
    - Create `src/domain/session.ts`: `unlock` exits lock iff the attempt contains at least one valid credential (even if an invalid passcode was also entered); only-invalid remains locked; `lock` re-enters lock
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [ ] 5.2 Implement background-timeout re-lock and sessionStore
    - Add `onBackground(elapsedMs, timeoutMs)` (re-lock iff `elapsedMs > timeoutMs`); create `src/state/sessionStore.ts` (Zustand) holding lock state, background timestamp, and configurable timeout wired to the mock `AuthService`
    - _Requirements: 3.1, 3.6_
  - [ ]* 5.3 Write property test for credential unlock
    - **Property 4: Any valid credential unlocks the session**
    - **Validates: Requirements 3.3, 3.4, 3.5**
    - Generate credential-result sets; unlock iff at least one valid
  - [ ]* 5.4 Write property test for background timeout re-lock
    - **Property 5: Background timeout re-locks deterministically**
    - **Validates: Requirements 3.6**
    - Generate elapsed/timeout pairs; re-lock iff `elapsedMs > timeoutMs`

- [ ] 6. Balances, assets, and wallet store
  - [ ] 6.1 Implement aggregate fiat and reserve/available selectors
    - Create `src/domain/balances.ts`: pure `aggregateFiat(assets)` summing each asset's `fiatValue` (incl. native XLM), plus reserved/available XLM computation against `Base_Reserve` and an unfunded-account flag
    - _Requirements: 4.1, 4.2, 4.6, 1.8, 2.6_
  - [ ] 6.2 Implement stale-data fallback balance selector and cache
    - Add a selector that, on refetch failure, returns exactly the last-known cached `Asset[]` with a stale indicator, and when no cache exists surfaces the stale indicator without fabricating balances
    - _Requirements: 4.4_
  - [ ] 6.3 Implement walletStore and balance query hook
    - Create `src/state/walletStore.ts` (active wallet metadata/derived address) and a React Query balance hook using the mock `ChainService` with stale-while-revalidate and manual refresh invalidation
    - _Requirements: 4.3, 4.5_
  - [ ]* 6.4 Write property test for aggregate fiat
    - **Property 6: Aggregate fiat equals the sum of asset fiat values**
    - **Validates: Requirements 4.1**
    - Generate random `Asset[]` including XLM
  - [ ]* 6.5 Write property test for stale-data fallback
    - **Property 7: Stale-data fallback preserves last-known balances**
    - **Validates: Requirements 4.4**
    - Generate cache-present/absent scenarios with a failed fetch

- [ ] 7. Send validation, transactions, and history
  - [ ] 7.1 Implement Stellar G-strkey address validation
    - Create `src/domain/address.ts`: validate `G` strkey version byte + CRC16 checksum (client-side format check backing `ChainService.validateAddress`)
    - _Requirements: 7.2, 7.3_
  - [ ] 7.2 Implement send validators (address / amount / reserve)
    - Create `src/domain/sendValidation.ts` returning a discriminated result accepted iff address valid, amount ≤ available balance, and (for XLM) resulting balance ≥ `Base_Reserve`; else reason `invalid-address` | `insufficient-funds` | `reserve`; include the create-and-fund-destination notice path; all math on `bigint` base units
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ] 7.3 Implement txStore append and failed-marking reducers
    - Create `src/state/txStore.ts` (Zustand): append-on-submit adds exactly one `pending` `Transaction` with matching `counterparty`/`amountBaseUnits`; a reducer marks a tx `failed` on broadcast failure while keeping it in history
    - _Requirements: 7.6, 7.8_
  - [ ] 7.4 Implement history sort selector
    - Add a pure stable sort selector (non-increasing by `timestamp`, preserving original order on ties)
    - _Requirements: 9.1_
  - [ ]* 7.5 Write property test for send validation
    - **Property 8: Send validation accepts exactly the valid sends**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - Generators cover valid sends and each invalid region (bad address, over-balance, reserve breach)
  - [ ]* 7.6 Write property test for valid-send append
    - **Property 9: A confirmed valid send appends exactly one pending transaction**
    - **Validates: Requirements 7.6, 7.8**
    - Generate starting history + valid send; assert length +1 and appended pending tx fields
  - [ ]* 7.7 Write property test for history stable sort
    - **Property 10: Transaction history is a stable sort by timestamp descending**
    - **Validates: Requirements 9.1**
    - Generate `Transaction[]` with duplicate timestamps; assert permutation, non-increasing, stable ties

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. NFC session machine and payload codec
  - [ ] 9.1 Implement NFC payload codec
    - Create `src/domain/nfcCodec.ts`: `decode(raw)` → `DecodedPayload` with `kind` (`address` | `x402-request` | `raw`), extracting `address` / `x402Url` / `raw`; plus an encode helper for tag writes
    - _Requirements: 6.2, 6.4, 8.4, 10.3, 10.5_
  - [ ] 9.2 Implement NFC_Manager session machine and deviceStore
    - Create `src/domain/nfcManager.ts` implementing `pair`, `tapToScan`, `cancel`, `decode` over the mock `NfcHardwareAdapter`, modeling the Idle→…→Idle lifecycle; `endSession` invoked exactly once in a `finally` path even when it throws; `cancel` returns control to the prior screen; capability `unavailable` refuses entry, `unknown` proceeds
    - Create `src/state/deviceStore.ts` (paired devices with labels, last scan, environment); persist/remove paired devices
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.5_
  - [ ]* 9.3 Write property test for NFC session closure
    - **Property 14: Every started NFC session is eventually closed**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
    - Generate all outcomes (decode ok, decode fail, cancel, session-ended) incl. `endSession` throwing; assert `endSession` called once and return to Idle
  - [ ]* 9.4 Write unit tests for NFC branches
    - Capability gating for `available`/`unavailable`/`unknown`; decode-error, cancel, and session-ended branches; address pre-fill mapping (R6.4)
    - _Requirements: 5.4, 5.5, 6.3, 6.4_

- [ ] 10. x402 agent payments (mock-backed)
  - [ ] 10.1 Implement X402Client.parseTerms and canPay
    - Create `src/domain/x402.ts`: `parseTerms` validates/normalizes `PaymentTerms` (reject unsupported stablecoin/scheme/network as `invalid-terms`); `canPay` returns `over-budget` when `amount > Spending_Budget`, `insufficient-funds` when `amount > Funded_Balance`, `expired` past `expiresAt`, else `allowed: true`; rejection performs no debit
    - _Requirements: 11.1, 13.1, 13.2, 14.1_
  - [ ] 10.2 Implement AgentWalletService, settlement debit, and agentStore
    - Create `src/domain/agentWallet.ts` (`fund`, `getFunding`, `setSpendingBudget`) and `src/state/agentStore.ts`: a settled payment of amount `a` decreases both `Spending_Budget` and `Funded_Balance` by exactly `a` (`bigint`, no drift); zero budget declines further payments
    - _Requirements: 11.1, 12.1, 12.2, 13.1_
  - [ ] 10.3 Implement X402Client.pay handshake against mock facilitator
    - Add `pay(url)`: run the 402 handshake via the mock facilitator (parse → `canPay` → sign via `Key_Manager` agent key → retry with proof); debit + record an agent `Transaction` only on `200 OK`; settlement/transport failure → `{ ok: false, reason: "network" }` with no debit; route decoded `x402-request` tap-to-pay into `pay`
    - _Requirements: 12.1, 13.1, 14.1_
  - [ ]* 10.4 Write property test for payment decision
    - **Property 11: NFC payment decision honors budget, balance, and expiry**
    - **Validates: Requirements 13.1, 13.2, 14.1**
    - Generate `PaymentTerms`/`AgentFunding` across over-budget, over-balance, expired, valid regions; rejected leaves funding unchanged
  - [ ]* 10.5 Write property test for exact debit and zero-budget decline
    - **Property 12: A settled payment debits budget and balance by exactly the amount**
    - **Validates: Requirements 12.1, 12.2, 13.1**
    - Generate funding + allowed amount; assert exact `bigint` debit; zero budget declines
  - [ ]* 10.6 Write property test for spend-never-exceeds-funded
    - **Property 13: Agent spend never exceeds funded balance**
    - **Validates: Requirements 11.1, 12.1, 13.1**
    - Generate random fund/pay sequences; cumulative settled spend never exceeds cumulative funded balance
  - [ ]* 10.7 Write unit tests for x402 failure paths
    - `invalid-terms` (unsupported stablecoin/scheme) signs nothing; `network` settlement failure records no agent tx and no debit
    - _Requirements: 12.1, 14.1_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Onboarding UI
  - [ ] 12.1 Build onboarding entry screen
    - Create `app/onboarding/index.tsx`: create-new vs import-existing entry (shown when no wallet or onboarding incomplete)
    - _Requirements: 1.1, 1.2_
  - [ ] 12.2 Build create-wallet screen
    - Create `app/onboarding/create.tsx` with `components/wallet/RecoveryPhraseDisplay.tsx`: generate 12/24-word phrase via `Key_Manager`, display it, proceed to confirm
    - _Requirements: 1.3, 1.4_
  - [ ] 12.3 Build confirm-phrase screen
    - Create `app/onboarding/confirm.tsx` with `components/wallet/PhraseConfirmGrid.tsx`: confirm the subset, show "words do not match" and stay on screen on mismatch, persist + navigate to home on success
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  - [ ] 12.4 Build import-wallet screen
    - Create `app/onboarding/import.tsx`: phrase entry with reason-specific validation messaging (`length`/`unknown-word`/`checksum`), block derivation on invalid, navigate to home on success
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 12.5 Write UI tests for onboarding
    - Create/confirm mismatch messaging and import validation messaging with React Native Testing Library
    - _Requirements: 1.4, 1.5, 2.2, 2.3_

- [ ] 13. Session lock UI and gate
  - [ ] 13.1 Build lock screen and root layout session gate
    - Create `app/lock.tsx` and update `app/_layout.tsx`: boot decision (wallet exists vs onboarding incomplete), gate the authenticated stack behind Session_Lock, unfunded-account handling on unlock target
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 1.8, 2.6_
  - [ ]* 13.2 Write navigation tests for boot routing and lock gate
    - Boot routing (wallet-exists vs onboarding-incomplete) and lock-before-tabs
    - _Requirements: 1.1, 1.2, 3.1_

- [ ] 14. Wallet home and asset detail UI
  - [ ] 14.1 Build wallet home
    - Create `app/(tabs)/index.tsx` with `components/wallet/BalanceHeader.tsx`, `AssetList.tsx`, `AssetRow.tsx`, `StaleDataBanner.tsx`: aggregate fiat header, asset rows (symbol/name/balance/fiat, XLM native), reserved-balance display, unfunded indicator, stale banner, manual refresh
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 1.8, 2.6_
  - [ ] 14.2 Build asset detail screen
    - Create `app/(tabs)/asset/[id].tsx`: balance and recent transactions for the selected asset
    - _Requirements: 4.3_
  - [ ]* 14.3 Write UI tests for home and asset detail
    - Aggregate header, stale banner presence, asset row fields
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 15. Send and receive UI
  - [ ] 15.1 Build send flow
    - Create `app/(tabs)/send.tsx` with `components/send/SendForm.tsx`: asset picker, recipient, amount; wire validators (invalid-address / insufficient-funds / reserve messages, create-account notice); on confirm sign via `Key_Manager` and submit via mock `ChainService.broadcast`, appending a pending tx
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  - [ ] 15.2 Build receive flow
    - Create `app/(tabs)/receive.tsx` with `components/receive/ReceivePanel.tsx`: address text + QR, copy-to-clipboard confirmation, block flow with error if text/QR cannot render, NFC write entry where supported
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 15.3 Write UI tests for send and receive
    - Send validation messaging; receive address/QR render, copy exact string, render-failure block
    - _Requirements: 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ] 16. Transaction history UI
  - [ ] 16.1 Build history list and detail
    - Create `app/(tabs)/history.tsx` (`components/tx/TxList.tsx`, `TxRow.tsx`) and `app/(tabs)/tx/[id].tsx` (`TxDetail.tsx`): sorted list (symbol/amount/direction/status/timestamp); detail shows counterparty/amount/status/timestamp and the Stellar tx hash only when confirmed with an on-chain id
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 16.2 Write UI tests for history and detail
    - Confirmed tx shows hash; pending omits it
    - _Requirements: 9.3, 9.4_

- [ ] 17. NFC scan sheet UI and wiring
  - [ ] 17.1 Build NFC scan modal and routing
    - Create `components/nfc/NfcScanSheet.tsx` presented as a modal sheet: scanning feedback, cancel returns to prior screen even if `endSession` throws; route a decoded address to pre-fill the send recipient and a decoded `x402-request` into tap-to-pay
    - _Requirements: 6.1, 6.4, 6.5, 5.6_
  - [ ]* 17.2 Write UI tests for scan sheet routing
    - Cancel returns to prior screen; address pre-fill and x402 routing
    - _Requirements: 6.4, 6.5_

- [ ] 18. Settings, connected devices, and developer tools UI
  - [ ] 18.1 Build settings root
    - Create `app/(tabs)/settings/index.tsx` with `components/settings/SettingsList.tsx`: security, connected devices, and developer tools sections; biometric enable/disable toggle; configurable background-lock timeout
    - _Requirements: 10.1, 3.2, 3.6_
  - [ ] 18.2 Build connected devices screen
    - Create `app/(tabs)/settings/connected-devices.tsx` (`components/settings/PairedDeviceList.tsx`): list paired devices with labels, remove a device, and start pairing (scan → confirm → assign label)
    - _Requirements: 10.2, 5.1, 5.2, 5.3, 5.7_
  - [ ] 18.3 Build developer tools screen
    - Create `app/(tabs)/settings/developer-tools.tsx` (`components/settings/DeveloperToolsPanel.tsx`): show last decoded scan (raw id + payload), Stellar environment selector routing to `ChainService.setEnvironment`, and a raw tag-write utility where supported
    - _Requirements: 10.3, 10.4, 10.5_
  - [ ]* 18.4 Write UI tests for settings/devices/dev tools
    - Section presence, paired-device list, last-scan render, environment selection routing
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 19. AI Agent UI (Fund AI, budget, tap-to-pay)
  - [ ] 19.1 Build Fund AI, budget, and activity UI
    - Create `app/(tabs)/agent.tsx` with `components/agent/FundAIButton.tsx`, `AgentBudgetControl.tsx`, `AgentActivityList.tsx`: fund the Agent_Wallet, set spending budget, and list agent activity/funding from `agentStore`
    - _Requirements: 11.1, 12.1, 12.2_
  - [ ] 19.2 Build tap-to-pay sheet
    - Create `components/agent/TapToPaySheet.tsx` wired to `X402Client.pay` (mock facilitator): show payment terms, budget/balance/expiry decision, and success/`network`-failure results
    - _Requirements: 13.1, 13.2, 14.1_
  - [ ]* 19.3 Write UI tests for agent flows
    - Fund/budget updates and tap-to-pay decision + result rendering
    - _Requirements: 12.1, 13.1, 14.1_

- [ ] 20. App integration and navigation wiring
  - [ ] 20.1 Wire adapters/stores via DI and complete the expo-router screen map
    - Create a provider/DI module injecting the mock adapters into stores/services; finalize `app/(tabs)/_layout.tsx` tab map (home, send, receive, history, agent, settings) and register all routes; ensure no orphaned screens
    - _Requirements: 1.7, 2.5, 3.1, 4.3, 10.1, 10.4_
  - [ ]* 20.2 Write integration/navigation tests
    - Full screen map, Session_Lock gate, and NFC scan modal returning to the prior screen on cancel
    - _Requirements: 3.1, 6.5, 9.3_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Deferred real web3/x402 integration (OUT OF SCOPE — do not implement now)
  - [ ]* 22.1 Implement real Stellar ChainService (Horizon/Soroban)
    - Replace the mock with a live `ChainService` (`getBalances`, `broadcast`, `validateAddress`) against Horizon/Soroban for the selected environment
    - _Requirements: 4.1, 7.5, 10.4_
  - [ ]* 22.2 Implement real SEP-0005 signing and transaction build/broadcast
    - Build/sign real Stellar transactions with the derived keypair and submit them on-chain
    - _Requirements: 7.5, 7.7_
  - [ ]* 22.3 Implement real x402 facilitator settlement transport
    - Replace the mock facilitator with the real HTTP-402 handshake + on-chain settlement transport
    - _Requirements: 14.1_
  - [ ]* 22.4 Implement real on-device NFC hardware adapter + EAS dev client config
    - Wire `react-native-nfc-manager` via the Expo config plugin (iOS entitlements / Android permission) behind `NfcHardwareAdapter` and build a custom dev client
    - _Requirements: 5.1, 6.1, 8.4, 10.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP: this covers all test sub-tasks (unit, property, integration/UI) and the entire **Section 22** deferred real-web3/x402 integration, which is intentionally out of scope for now.
- All non-optional tasks in Sections 1–20 build the fully functional, testable app against **mock/in-memory adapters** — no blockchain, network, or NFC hardware required.
- Every property test uses **fast-check** at **≥100 runs** and is tagged `// Feature: noir-wallet-ui, Property {number}: {property_text}`, mapped 1:1 to the design's Correctness Properties (Properties 1–14).
- Each task references specific requirements for traceability; checkpoints ensure incremental validation.
- All code lives inside `c:\Users\Richie\Projects\Noir\Noir`; nothing is written to the `Noir_Wallet` spec folder.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "5.1", "6.1", "7.1", "9.1", "10.1"] },
    { "id": 3, "tasks": ["3.4", "5.2", "6.2", "7.2", "9.2", "10.2"] },
    { "id": 4, "tasks": ["6.3", "7.3", "7.4", "10.3"] },
    { "id": 5, "tasks": ["3.5", "3.6", "3.7", "3.8", "5.3", "5.4", "6.4", "6.5", "7.5", "7.6", "7.7", "9.3", "9.4", "10.4", "10.5", "10.6", "10.7"] },
    { "id": 6, "tasks": ["12.1", "12.2", "12.3", "12.4", "13.1", "14.1", "14.2", "15.1", "15.2", "16.1", "17.1", "18.1", "18.2", "18.3", "19.1", "19.2"] },
    { "id": 7, "tasks": ["12.5", "13.2", "14.3", "15.3", "16.2", "17.2", "18.4", "19.3"] },
    { "id": 8, "tasks": ["20.1"] },
    { "id": 9, "tasks": ["20.2"] },
    { "id": 10, "tasks": ["22.1", "22.2", "22.3", "22.4"] }
  ]
}
```
