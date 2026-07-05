import { ChatMessage, SmartTip } from '@/types'

const RESPONSES: Record<string, string> = {
  balance: 'Your current balance is **₱12,450.50** — that\'s **$215 USD** and **1,250 XLM**. Would you like to see a breakdown?',
  send: 'To send USDC, tap the **Send** button on your dashboard. You can enter a Stellar address or scan an NFC tag. The fee is ~0.00001 XLM.',
  receive: 'Tap **Receive** on your dashboard to see your QR code. Share that with anyone who wants to send you funds. Your Stellar address is: `GABCD...EFGH`',
  device: 'Your NFC devices let you tap-to-pay at any Noir-enabled terminal. Go to **Devices** tab to see your linked hardware wallets.',
  transaction: 'Your last transaction was **₱450.00** at **7-Eleven** — confirmed 2 minutes ago. You\'ve made 12 transactions today totaling ₱8,900.',
  security: 'Your account is protected by biometric lock. For extra security, enable the **auto-lock** feature in Settings — it locks after 60s in background.',
  stellar: 'Noir Wallet runs on the **Stellar network** — fast, low-cost transactions settled in 3-5 seconds. Testnet is for testing, Mainnet is for real value.',
  help: 'I can help you with:\n• Check your **balance**\n• **Send** and **Receive** funds\n• Manage **NFC devices**\n• View **transactions**\n• **Security** settings\n• **Stellar network** info\n\nJust ask me anything!',
}

const FALLBACK = 'I understand you\'re asking about that. For now, you can check your **Dashboard** for the latest info, or visit **Settings** to configure your preferences. How else can I help?'

export class AIService {
  async sendMessage(text: string, history: ChatMessage[]): Promise<string> {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

    const lower = text.toLowerCase()

    if (lower.includes('balance') || lower.includes('how much') || lower.includes('money')) {
      return RESPONSES.balance
    }
    if (lower.includes('send') || lower.includes('transfer') || lower.includes('pay')) {
      return RESPONSES.send
    }
    if (lower.includes('receive') || lower.includes('qr') || lower.includes('address')) {
      return RESPONSES.receive
    }
    if (lower.includes('device') || lower.includes('nfc') || lower.includes('tap') || lower.includes('hardware')) {
      return RESPONSES.device
    }
    if (lower.includes('transaction') || lower.includes('history') || lower.includes('activity') || lower.includes('recent')) {
      return RESPONSES.transaction
    }
    if (lower.includes('security') || lower.includes('lock') || lower.includes('biometric') || lower.includes('pin')) {
      return RESPONSES.security
    }
    if (lower.includes('stellar') || lower.includes('network') || lower.includes('blockchain') || lower.includes('soroban')) {
      return RESPONSES.stellar
    }
    if (lower.includes('help') || lower.includes('what') || lower.includes('can you') || lower.includes('how')) {
      return RESPONSES.help
    }

    return FALLBACK
  }

  getSmartTips(): SmartTip[] {
    return [
      {
        id: 'tip-1',
        title: 'Link an NFC Device',
        description: 'Tap-to-pay is faster and more secure. Link your first NFC hardware wallet.',
        icon: 'radio-outline',
        action: { label: 'Go to Devices', route: '/(tabs)/devices' },
        dismissible: true,
      },
      {
        id: 'tip-2',
        title: 'Daily Spend Limit',
        description: 'You\'ve used ₱8,900 of your ₱50,000 daily limit. Manage budgets in Devices.',
        icon: 'wallet-outline',
        action: { label: 'View Limits', route: '/(tabs)/devices' },
        dismissible: true,
      },
      {
        id: 'tip-3',
        title: 'Auto-Lock Enabled',
        description: 'Your wallet locks after 60 seconds in background. Keep your funds safe.',
        icon: 'shield-checkmark-outline',
        action: { label: 'Security Settings', route: '/settings/security' },
        dismissible: false,
      },
      {
        id: 'tip-4',
        title: 'Network: Testnet',
        description: 'You\'re on Stellar Testnet. Switch to Mainnet in Settings for real transactions.',
        icon: 'globe-outline',
        action: { label: 'Switch Network', route: '/settings/network' },
        dismissible: true,
      },
    ]
  }
}

export const aiService = new AIService()
