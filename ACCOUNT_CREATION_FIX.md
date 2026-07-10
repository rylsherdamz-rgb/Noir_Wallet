# Account Creation Fix - "Account Not Found" Issue

## Problem Summary

The Noir Wallet was experiencing "account not found" errors when trying to use newly created accounts. This happened because:

1. **Accounts weren't being funded properly** - The `fundTestnetAccount()` calls were not being awaited, so the code continued before the account existed on-chain
2. **No account existence checks** - The soroban contract calls didn't verify the account existed before trying to use it
3. **Race conditions** - NFC device registration and x402 agent creation were failing because accounts didn't exist yet

## Root Cause

The previous implementation called `stellarService.fundTestnetAccount()` **without awaiting** it:

```typescript
// ❌ WRONG - doesn't wait for account to be created
stellarService.fundTestnetAccount(keys.stellarPublic)
router.replace('/seed-verify')
```

This meant the app would immediately try to use the account for Soroban contract calls, but the account didn't exist on-chain yet, causing **"Account Not Found"** errors.

## How Stellar CLI Does It

The Stellar CLI properly:
1. Calls Friendbot and **waits** for the response
2. Verifies the account exists by attempting to load it
3. Retries if needed
4. Only proceeds when the account is confirmed on-chain

## Fixes Applied

### 1. Made Account Creation Async (seed-phrase.tsx)

```typescript
// ✅ FIXED - now awaits account funding
const handleNext = async (keys: WalletKeys) => {
  setUser({ /* ... */ })
  
  // Fund account and WAIT for it to be created on-chain
  const funded = await stellarService.fundTestnetAccount(keys.stellarPublic)
  
  if (!funded) {
    console.warn('Testnet funding failed - account may need manual funding')
  }
  
  router.replace('/seed-verify')
}
```

### 2. Fixed Import Wallet Flow (import-wallet.tsx)

```typescript
// ✅ FIXED - awaits funding before proceeding
const handleComplete = async (keys: WalletKeys) => {
  setUser({ /* ... */ })
  setIsOnboarded(true)
  
  const funded = await stellarService.fundTestnetAccount(keys.stellarPublic)
  
  router.replace('/(tabs)')
}
```

### 3. Improved fundTestnetAccount (stellar.ts)

Enhanced the Friendbot funding with:
- ✅ Longer timeout (15s instead of 10s)
- ✅ Checks for "already funded" responses
- ✅ Waits 2s after funding for network propagation
- ✅ Verifies account exists by trying to load it
- ✅ Retries verification if first attempt fails
- ✅ Final fallback check if account already exists
- ✅ Better error messages and logging

```typescript
async fundTestnetAccount(publicKey: string): Promise<boolean> {
  // Try both Friendbot URLs
  for (const url of urls) {
    // ... fund account ...
    
    if (json.hash) {
      // Wait for network propagation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verify account was created
      try {
        await this.server.loadAccount(publicKey)
        return true
      } catch {
        // Retry once after additional wait
        await new Promise(resolve => setTimeout(resolve, 3000))
        // ...
      }
    }
  }
  
  // Final check if account already exists
  return !!(await this.server.loadAccount(publicKey))
}
```

### 4. Fixed x402 Agent Creation (x402.ts)

```typescript
// ✅ FIXED - awaits agent account funding
async createAgent(): Promise<AgentWallet> {
  const kp = Keypair.random()
  // ... save keys ...
  
  // Fund agent account and wait
  const funded = await stellarService.fundTestnetAccount(kp.publicKey())
  if (!funded) {
    console.warn('Agent account funding failed')
  }
  
  return { /* ... */ }
}
```

### 5. Added Account Existence Checks (soroban.ts)

Both `readContract` and `invokeContract` now check if the account exists before trying to use it:

```typescript
export async function invokeContract(params: InvokeContractParams): Promise<string> {
  const server = getServer()
  
  // ✅ NEW - Check if account exists first
  const accountExists = await sourceAccountExists(params.source)
  if (!accountExists) {
    throw new Error(
      `Account ${params.source.slice(0, 8)}... does not exist on-chain. ` +
      `Please fund this account first via Friendbot or by receiving XLM.`
    )
  }
  
  const account = await server.getAccount(params.source)
  // ... rest of function
}
```

### 6. Added Loading States

- **SeedPhraseScreen**: Shows "Creating Account..." while funding
- **ImportWalletScreen**: Shows "Importing..." during the entire process
- Both screens are disabled during async operations to prevent double-clicks

## Testing the Fix

1. **Create a new wallet:**
   - Go through onboarding → Create wallet
   - Save the seed phrase
   - The app now waits for the account to be funded before proceeding
   - Verify: You should see "Creating Account..." briefly

2. **Import existing wallet:**
   - Use "I already have a wallet" → Enter seed phrase
   - The app waits for funding before continuing
   - Verify: Button shows "Importing..."

3. **Link NFC device:**
   - After account is created, go to Devices tab
   - Link a device - should work without "account not found" errors
   - The device registration will only proceed after account is confirmed

4. **Check logs:**
   - You should see console logs like:
     - "Account successfully funded via Friendbot: <hash>"
     - "Account verified on-chain"

## Network Considerations

### Testnet
- Uses Friendbot to create accounts with 10,000 XLM
- May be slow or rate-limited during peak times
- If Friendbot fails, user can manually fund via Stellar Laboratory

### Mainnet (Future)
- Accounts must be funded by sending XLM from another account
- Minimum balance: 1 XLM (base reserve)
- The app should handle mainnet differently (show QR code to receive initial funding)

## Fallback Behavior

If Friendbot fails after all retries:
- The function returns `false` but doesn't throw
- A warning is logged
- The app continues but warns the user
- User can retry funding from the Dashboard via the TestnetFaucetBanner

## Next Steps

Consider these improvements:

1. **Add retry UI** - Show a "Retry Funding" button if account creation fails
2. **Progress indicator** - Show detailed steps: "Contacting Friendbot...", "Waiting for confirmation...", etc.
3. **Mainnet support** - Implement proper account funding flow for mainnet (receive-first model)
4. **Better error messages** - Surface Friendbot errors to the user with actionable guidance

## Related Files Changed

- ✅ `frontend/app/seed-phrase.tsx` - Made async, awaits funding
- ✅ `frontend/app/import-wallet.tsx` - Made async, awaits funding  
- ✅ `frontend/src/screens/SeedPhraseScreen.tsx` - Added loading state
- ✅ `frontend/src/screens/ImportWalletScreen.tsx` - Added loading state
- ✅ `frontend/src/services/stellar.ts` - Improved fundTestnetAccount with retries
- ✅ `frontend/src/domain/x402.ts` - Fixed agent creation to await funding
- ✅ `frontend/src/lib/soroban.ts` - Added account existence checks

## References

- [Stellar Friendbot Documentation](https://developers.stellar.org/docs/fundamentals-and-concepts/testnet-and-pubnet#friendbot)
- [Stellar Account Creation](https://developers.stellar.org/docs/encyclopedia/accounts)
- [Soroban RPC Methods](https://developers.stellar.org/docs/data/rpc/api-reference/methods)
