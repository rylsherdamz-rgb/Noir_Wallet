# Requirements Document

## Introduction

Noir Wallet is a cross-platform (iOS and Android) mobile wallet application built with Expo React Native that operates on the Stellar network. XLM (lumens) is the primary, native asset, while other Stellar assets (issued tokens and Stellar Asset Contract assets) may also be held. Its primary differentiator is first-class NFC/RFID integration aimed at developers who build and test IoT hardware. This spec covers the user-facing UI and client-side behavior of the mobile app: wallet onboarding and Stellar key handling, the wallet home with balances and assets, NFC/RFID device pairing and tap-to-scan flows, sending and receiving transactions, transaction history, and a settings area that includes security controls, connected devices, and developer tools.

Because the app targets Stellar, the client must account for Stellar-specific behavior: keypairs are Ed25519, public addresses are Stellar account IDs (G... strkeys) and secret keys are S... strkeys, recovery phrases use BIP-39 mnemonics with SEP-0005 (SLIP-0010 ed25519) derivation, and a Stellar account must be funded above the network base reserve before it exists on-ledger or can hold additional assets.

This document focuses on the mobile client (UI, local state, device interaction, and client-side validation). Backend services, Stellar Horizon/RPC infrastructure, and on-chain protocol behavior are out of scope except where the client must format, sign, or validate data before submission to the Stellar network.

## Glossary

- **Noir_Wallet_App**: The Expo React Native mobile application running on a user's iOS or Android device.
- **Onboarding_Module**: The component responsible for first-run wallet creation, import, and initial security setup.
- **Key_Manager**: The component that generates, encrypts, stores, and retrieves Stellar Ed25519 keypairs and recovery phrases using the device secure storage.
- **Recovery_Phrase**: A BIP-39 mnemonic sequence of words used with SEP-0005 (SLIP-0010 ed25519) derivation to derive and restore a Stellar wallet.
- **Secure_Storage**: The device-provided encrypted storage facility (iOS Keychain / Android Keystore) abstracted through Expo SecureStore.
- **Stellar_Network**: The Stellar blockchain network the Noir_Wallet_App connects to, selectable between Stellar mainnet (public network) and Stellar testnet.
- **XLM**: Lumens, the native asset of the Stellar_Network and the primary asset of the wallet, used for transaction fees and to satisfy the Base_Reserve.
- **Stellar_Account_ID**: A Stellar public account identifier encoded as a strkey beginning with "G" (the wallet's receiving address).
- **Stellar_Secret_Key**: A Stellar Ed25519 secret key encoded as a strkey beginning with "S".
- **Base_Reserve**: The minimum XLM balance the Stellar_Network requires an account to hold to exist on-ledger; the minimum required balance increases with the number of subentries (such as additional asset trustlines).
- **Wallet_Home**: The main screen displaying aggregate balance and the list of held assets.
- **Asset**: A Stellar asset held in the wallet, either the native asset XLM or an issued Stellar asset (issued token or Stellar Asset Contract asset), with a symbol, name, balance, and fiat value.
- **NFC_Manager**: The component that manages NFC/RFID scanning sessions and decodes tag payloads.
- **RFID_Tag**: A physical NFC or RFID device/tag that the app reads from or writes to.
- **Paired_Device**: An RFID_Tag or hardware device the user has registered with the app for repeated use.
- **Transaction**: A transfer of an Asset that has a recipient address, amount, status, and timestamp.
- **Transaction_History**: The chronological record of past and pending Transactions.
- **Settings_Module**: The component exposing security, connected devices, and developer tool configuration.
- **Developer_Tools**: A settings area exposing NFC/RFID payload inspection, Stellar_Network environment selection (mainnet or testnet), and raw tag read/write utilities.
- **Session_Lock**: The state in which the app requires authentication before exposing wallet data.

## Requirements

### Requirement 1: Wallet Onboarding and Creation

**User Story:** As a new user, I want to create a new wallet on first launch, so that I can begin holding and managing assets securely.

#### Acceptance Criteria

1. WHEN the Noir_Wallet_App launches and no wallet exists in Secure_Storage, THE Onboarding_Module SHALL display a wallet creation entry screen with options to create a new wallet or import an existing wallet.
2. IF the Noir_Wallet_App launches and a wallet record exists in Secure_Storage but onboarding has not been marked complete, THEN THE Onboarding_Module SHALL display the wallet creation entry screen so the user can complete or restart onboarding.
3. WHEN a user chooses to create a new wallet, THE Key_Manager SHALL generate a Recovery_Phrase of 12 or 24 words derived from a cryptographically secure random source and SHALL derive a Stellar Ed25519 keypair from the Recovery_Phrase using SEP-0005 (SLIP-0010 ed25519) derivation.
4. WHEN a Recovery_Phrase is generated, THE Onboarding_Module SHALL display the Recovery_Phrase and require the user to confirm the phrase by re-entering a subset of the words before continuing.
5. IF the user-entered confirmation words do not match the generated Recovery_Phrase, THEN THE Onboarding_Module SHALL reject the confirmation and display an error message identifying that the words do not match.
6. WHEN wallet creation completes successfully, THE Key_Manager SHALL encrypt the Stellar_Secret_Key and Recovery_Phrase and persist them in Secure_Storage.
7. WHEN wallet creation completes successfully, THE Noir_Wallet_App SHALL navigate to the Wallet_Home screen.
8. WHILE a newly created Stellar_Account_ID has not yet been funded above the Base_Reserve on the Stellar_Network, THE Wallet_Home SHALL display an unfunded-account indicator stating the account must receive a minimum XLM balance before it exists on-ledger.

### Requirement 2: Wallet Import and Recovery

**User Story:** As a returning user, I want to import an existing wallet using my recovery phrase, so that I can access my assets on a new device.

#### Acceptance Criteria

1. WHEN a user chooses to import a wallet, THE Onboarding_Module SHALL display an input for entering a Recovery_Phrase.
2. WHEN a user submits a Recovery_Phrase, THE Key_Manager SHALL validate that the phrase conforms to the BIP-39 word list and checksum before deriving any keys.
3. IF a submitted Recovery_Phrase fails validation, THEN THE Key_Manager SHALL block key derivation and THE Onboarding_Module SHALL display an error message describing the validation failure.
4. WHEN a valid Recovery_Phrase is submitted, THE Key_Manager SHALL derive the Stellar Ed25519 keypair using SEP-0005 (SLIP-0010 ed25519) derivation, encrypt the Stellar_Secret_Key, and persist it in Secure_Storage.
5. WHEN a wallet import completes successfully, THE Noir_Wallet_App SHALL navigate to the Wallet_Home screen.
6. IF an imported Stellar_Account_ID does not exist on the Stellar_Network because it has not been funded above the Base_Reserve, THEN THE Wallet_Home SHALL display the account as unfunded and SHALL indicate that the account requires a minimum XLM balance before it holds assets.

### Requirement 3: App Security and Session Lock

**User Story:** As a wallet owner, I want the app to lock and require authentication, so that my assets are protected if my device is lost or unattended.

#### Acceptance Criteria

1. WHEN a wallet exists and the Noir_Wallet_App launches, THE Noir_Wallet_App SHALL start in the Session_Lock state and require authentication before displaying wallet data.
2. THE Settings_Module SHALL allow the user to enable or disable biometric authentication where the device supports biometrics.
3. WHEN a user provides a valid passcode or biometric credential, THE Noir_Wallet_App SHALL exit the Session_Lock state and reveal wallet data.
4. IF a user provides an invalid passcode while no valid credential has been accepted, THEN THE Noir_Wallet_App SHALL remain in the Session_Lock state and display an authentication failure message.
5. WHEN any valid credential is provided during an authentication attempt, THE Noir_Wallet_App SHALL exit the Session_Lock state even if an invalid passcode was also entered during the same attempt.
6. WHILE the Noir_Wallet_App is backgrounded for longer than a configurable timeout, THE Noir_Wallet_App SHALL re-enter the Session_Lock state.

### Requirement 4: Wallet Home and Balances

**User Story:** As a wallet owner, I want to see my total balance and individual assets, so that I can understand my holdings at a glance.

#### Acceptance Criteria

1. WHEN the Wallet_Home screen is displayed, THE Wallet_Home SHALL show the aggregate fiat value of all held Assets, including the native asset XLM.
2. WHEN the Wallet_Home screen is displayed, THE Wallet_Home SHALL show a list of Assets where each row displays the asset symbol, asset name, token balance, and fiat value, and SHALL list XLM as the native asset.
3. WHEN a user selects an Asset from the list, THE Noir_Wallet_App SHALL display an asset detail view showing the balance and recent Transactions for that Asset.
4. IF asset balance data cannot be retrieved, THEN THE Wallet_Home SHALL display a stale data indicator, and SHALL display the last known balances when last known balances are available.
5. WHEN a user triggers a manual refresh, THE Wallet_Home SHALL re-request balance data and update the displayed values.
6. WHILE an account's XLM balance is at or near the Base_Reserve, THE Wallet_Home SHALL display the portion of the XLM balance that is reserved and therefore unavailable to spend.

### Requirement 5: NFC/RFID Device Pairing

**User Story:** As a developer, I want to pair NFC/RFID tags and devices with the app, so that I can reuse them for scanning and testing.

#### Acceptance Criteria

1. WHEN a user initiates device pairing, THE NFC_Manager SHALL start an NFC scanning session and prompt the user to tap an RFID_Tag.
2. WHEN an RFID_Tag is detected during pairing, THE NFC_Manager SHALL read the tag identifier and present the decoded identifier to the user for confirmation.
3. WHEN a user confirms a detected RFID_Tag, THE Settings_Module SHALL persist the tag as a Paired_Device with a user-assigned label.
4. IF the device hardware does not support NFC, THEN THE NFC_Manager SHALL display a message stating NFC is unavailable and SHALL prevent entry into pairing flows.
5. IF the NFC hardware capability cannot be determined, THEN THE NFC_Manager SHALL allow the pairing attempt to proceed and SHALL surface any resulting hardware error during the scanning session.
6. WHEN an NFC scanning session for pairing ends without a confirmed RFID_Tag, THE NFC_Manager SHALL end the session and display a session-ended message describing the reason.
7. WHEN a user removes a Paired_Device, THE Settings_Module SHALL delete the Paired_Device record from local storage.

### Requirement 6: Tap-to-Scan Flow

**User Story:** As a user, I want to tap an NFC/RFID tag to trigger an action, so that I can quickly initiate transactions or read data from hardware.

#### Acceptance Criteria

1. WHEN a user starts a tap-to-scan action, THE NFC_Manager SHALL start an NFC scanning session and display scanning feedback to the user.
2. WHEN an RFID_Tag is scanned, THE NFC_Manager SHALL decode the tag payload into a structured result containing the tag identifier and payload data.
3. IF a scanned RFID_Tag payload cannot be decoded, THEN THE NFC_Manager SHALL end the session and display a decode error message.
4. WHEN a tap-to-scan result contains a recipient address payload, THE Noir_Wallet_App SHALL pre-fill the recipient field of the send flow with the decoded Stellar_Account_ID.
5. WHEN a user cancels an active scanning session, THE NFC_Manager SHALL end the session and SHALL attempt to return the user to the prior screen even if ending the session fails.

### Requirement 7: Send Transactions

**User Story:** As a wallet owner, I want to send assets to a recipient, so that I can transfer value to others.

#### Acceptance Criteria

1. WHEN a user opens the send flow, THE Noir_Wallet_App SHALL display inputs for selecting an Asset, entering a recipient Stellar_Account_ID, and entering an amount.
2. WHEN a user enters a recipient address, THE Noir_Wallet_App SHALL validate that the address is a well-formed Stellar_Account_ID with a valid "G" strkey format and checksum.
3. IF a recipient address fails Stellar_Account_ID format or checksum validation, THEN THE Noir_Wallet_App SHALL reject the send and display an invalid address message.
4. IF an entered amount exceeds the available balance of the selected Asset, THEN THE Noir_Wallet_App SHALL reject the send and display an insufficient funds message.
5. IF the selected Asset is XLM and the entered amount would reduce the account's XLM balance below the Base_Reserve, THEN THE Noir_Wallet_App SHALL reject the send and display a message stating the account must retain the minimum reserve.
6. IF the recipient Stellar_Account_ID does not yet exist on the Stellar_Network, THEN THE Noir_Wallet_App SHALL inform the user that the transaction will create and fund the destination account and SHALL require an XLM amount sufficient to meet the Base_Reserve.
7. WHEN a user confirms a valid send, THE Key_Manager SHALL sign the Transaction using the stored Stellar_Secret_Key and THE Noir_Wallet_App SHALL submit the signed Transaction to the Stellar_Network.
8. WHEN a Transaction is submitted, THE Noir_Wallet_App SHALL add the Transaction to Transaction_History with a pending status.

### Requirement 8: Receive Transactions

**User Story:** As a wallet owner, I want to display my receiving address, so that others can send assets to me.

#### Acceptance Criteria

1. WHEN a user opens the receive flow, THE Noir_Wallet_App SHALL display the Stellar_Account_ID for the wallet as text and as a scannable QR code.
2. IF the Noir_Wallet_App cannot generate or display either the Stellar_Account_ID text or the QR code, THEN THE Noir_Wallet_App SHALL block the receive flow and display an error message.
3. WHEN a user requests to copy the receiving address, THE Noir_Wallet_App SHALL copy the Stellar_Account_ID to the device clipboard and display a confirmation.
4. WHERE the device supports NFC tag writing, THE NFC_Manager SHALL allow the user to write the Stellar_Account_ID to an RFID_Tag.

### Requirement 9: Transaction History

**User Story:** As a wallet owner, I want to view my past and pending transactions, so that I can track my activity.

#### Acceptance Criteria

1. WHEN the Transaction_History screen is displayed, THE Transaction_History SHALL show Transactions ordered from most recent to least recent by timestamp.
2. WHEN a Transaction is displayed in the list, THE Transaction_History SHALL show the Asset symbol, amount, direction, status, and timestamp.
3. WHEN a user selects a Transaction, THE Noir_Wallet_App SHALL display a Transaction detail view showing the recipient or sender address, amount, status, and timestamp.
4. WHERE a Transaction has a confirmed status with an on-chain identifier, THE Transaction detail view SHALL display the Stellar transaction hash.

### Requirement 10: Settings, Connected Devices, and Developer Tools

**User Story:** As a developer user, I want a settings area with security, connected devices, and developer tools, so that I can configure the app and inspect NFC/RFID interactions.

#### Acceptance Criteria

1. WHEN a user opens the Settings_Module, THE Settings_Module SHALL display sections for security settings, connected devices, and Developer_Tools.
2. WHEN a user opens the connected devices section, THE Settings_Module SHALL display the list of Paired_Devices with their user-assigned labels.
3. WHEN a user opens Developer_Tools, THE Developer_Tools SHALL display the most recent decoded NFC/RFID scan result including the raw tag identifier and payload data.
4. WHEN a user selects a Stellar_Network environment in Developer_Tools, THE Noir_Wallet_App SHALL apply the selected environment (Stellar mainnet or testnet) to subsequent Transaction submissions.
5. WHERE the device supports NFC tag writing, THE Developer_Tools SHALL provide a utility to write user-specified data to an RFID_Tag.
