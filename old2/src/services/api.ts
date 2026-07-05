import { Config, AppConfig } from '@/constants/config'
import { Device, Transaction, MerchantSettings, Balance } from '@/types'

class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = Config.apiBaseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
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
