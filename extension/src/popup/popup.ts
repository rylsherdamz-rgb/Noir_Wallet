import { activity } from './activity'
import { agents, cards } from './cards'
import { nav, refresh, type Tab } from './kit'
import { onboarding, onEntered, unlockScreen } from './onboarding'
import { settings } from './settings'
import { home } from './wallet'

const TABS: Record<Tab, () => unknown> = { wallet: home, cards, agents, activity, settings }

// Remembered per viewer so the popup reopens where it was left.
const lastTab = (): Tab => {
  try { const t = sessionStorage.getItem('tab') as Tab | null; return t && t in TABS ? t : 'wallet' } catch { return 'wallet' }
}

nav.tab = async (t: Tab) => {
  const s = await refresh()
  if (!s.hasWallet) return onboarding()
  if (!s.unlocked) return unlockScreen()
  try { sessionStorage.setItem('tab', t) } catch { /* storage blocked */ }
  void TABS[t]()
}

onEntered(() => nav.tab('wallet'))

if (location.hash === '#onboarding') document.body.classList.add('window')
void nav.tab(lastTab())
