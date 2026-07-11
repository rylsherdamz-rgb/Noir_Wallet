import { Config, AppConfig, apiKey } from '@/constants/config'
import { Device, Transaction, MerchantSettings, Balance, Notification } from '@/types'

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = Config.apiBaseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (apiKey) {
      headers['x-api-key'] = apiKey
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(error || `HTTP ${res.status}`)
    }

    return res.json()
  }

  // Auth
  async signup(email: string, phoneNumber: string, stellarPublicKey: string) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, phoneNumber, stellarPublicKey }),
    })
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Devices
  async registerDevice(deviceUidHash: string, label: string) {
    return this.request<{ device: Device }>('/devices/register', {
      method: 'POST',
      body: JSON.stringify({ deviceUidHash, label }),
    })
  }

  async getDevices() {
    return this.request<{ devices: Device[] }>('/devices')
  }

  async updateDeviceStatus(deviceId: string, status: Device['status']) {
    return this.request<{ device: Device }>(`/devices/${deviceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Payments
  async initiatePayment(params: {
    rawDeviceUid: string
    merchantPublicKey: string
    amountCents: number
    assetCode: string
    terminalId?: string
    nonce?: string
  }) {
    return this.request<{ status: string; message: string; txHash?: string }>(
      '/payments/initiate',
      {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          terminalId: params.terminalId || AppConfig.terminal.id,
        }),
      },
    )
  }

  /** Provision a passive NFC card: backend mints+funds a custodied wallet for the UID. */
  async provisionCard(deviceSerial: string, dailyLimitStroops?: number) {
    return this.request<{ device_hash: string; wallet_address: string; status: string }>(
      '/cards/provision',
      {
        method: 'POST',
        body: JSON.stringify({ device_serial: deviceSerial, daily_limit_stroops: dailyLimitStroops }),
      },
    )
  }

  /**
   * Custodial UID-authorized tap payment: merchant sends the card UID + amount;
   * the backend signs from the card's custodied wallet, fee-bumps, and submits.
   * This is how a passive (keyless) NFC card pays.
   */
  async tapPay(params: {
    deviceSerial: string
    destinationWallet: string
    amountStroops: number
    idempotencyKey: string
    memo?: string
  }) {
    return this.request<{
      status: string
      transaction_id: string
      device_hash: string
      submitted_at: string
      stellar_tx_hash?: string
      error?: string
    }>('/payment/tap', {
      method: 'POST',
      body: JSON.stringify({
        device_serial: params.deviceSerial,
        destination_wallet: params.destinationWallet,
        amount_stroops: params.amountStroops,
        idempotency_key: params.idempotencyKey,
        memo: params.memo,
      }),
    })
  }

  /** Register a device in the backend payment DB (device_serial -> wallet). */
  async registerPaymentDevice(deviceSerial: string, walletAddress: string) {
    return this.request<{ device_hash: string; status: string }>('/devices/register', {
      method: 'POST',
      body: JSON.stringify({ device_serial: deviceSerial, wallet_address: walletAddress }),
    })
  }

  /**
   * Non-custodial fee-bump payment: send the user-signed inner transaction XDR
   * to the backend, which fee-bumps it with a channel account and submits it.
   * Field names match the backend `PaymentRequest` (snake_case).
   */
  async payViaBackend(params: {
    deviceSerial: string
    destinationWallet: string
    amountStroops: number
    signedXdr: string
    idempotencyKey: string
    memo?: string
  }) {
    return this.request<{
      status: string
      transaction_id: string
      device_hash: string
      submitted_at: string
      stellar_tx_hash?: string
      error?: string
    }>('/payment', {
      method: 'POST',
      body: JSON.stringify({
        device_serial: params.deviceSerial,
        destination_wallet: params.destinationWallet,
        amount_stroops: params.amountStroops,
        memo: params.memo,
        idempotency_key: params.idempotencyKey,
        signed_xdr: params.signedXdr,
      }),
    })
  }

  /** Poll a payment's status by transaction id. */
  async getPaymentStatus(transactionId: string) {
    return this.request<{
      status: string
      transaction_id: string
      stellar_tx_hash?: string
      error_message?: string
    }>(`/payment/${transactionId}`)
  }

  /** Batch process offline transactions when connectivity is restored */
  async batchPayments(payments: any[]) {
    return this.request<{ processed: number }>('/payments/batch', {
      method: 'POST',
      body: JSON.stringify({ payments }),
    })
  }

  async getTransactions() {
    return this.request<{ transactions: Transaction[] }>('/transactions')
  }

  // Balances
  async getBalance() {
    return this.request<{ balance: Balance }>('/balance')
  }

  // Merchant
  async getMerchantSettings() {
    return this.request<{ settings: MerchantSettings }>('/merchant/settings')
  }

  async updateMerchantSettings(settings: Partial<MerchantSettings>) {
    return this.request<{ settings: MerchantSettings }>('/merchant/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: Notification[] }>('/notifications')
  }

  // Push Notifications
  async registerPushToken(token: string) {
    return this.request<{ ok: boolean }>('/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token, platform: 'expo' }),
    })
  }

  // PDAX
  async pdaxQuote(amountCents: number, fromAsset: string, toAsset: string) {
    return this.request<{ quote: any }>('/pdax/quote', {
      method: 'POST',
      body: JSON.stringify({ amountCents, fromAsset, toAsset }),
    })
  }

  async pdaxCashIn(amountCents: number) {
    return this.request<{ reference: string }>('/pdax/cash-in', {
      method: 'POST',
      body: JSON.stringify({ amountCents }),
    })
  }

  async pdaxCashOut(amountCents: number) {
    return this.request<{ reference: string }>('/pdax/cash-out', {
      method: 'POST',
      body: JSON.stringify({ amountCents }),
    })
  }
}

export const apiService = new ApiService()
