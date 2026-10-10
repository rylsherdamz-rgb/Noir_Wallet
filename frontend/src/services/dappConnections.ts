import { getItem, setItem } from '@/services/storage'

/**
 * Sites the user has connected in the Browse tab, per wallet address.
 * A connected site may read the address and ask for signatures; every
 * signature still needs approval.
 */
const KEY = 'dapp_connections'

type Connections = Record<string, string[]>

async function load(): Promise<Connections> {
  const c = await getItem<Connections>(KEY)
  return c && typeof c === 'object' ? c : {}
}

export const dappConnections = {
  async list(address: string): Promise<string[]> {
    return (await load())[address] ?? []
  },
  async isConnected(address: string, origin: string): Promise<boolean> {
    return (await this.list(address)).includes(origin)
  },
  async add(address: string, origin: string): Promise<void> {
    const all = await load()
    const list = all[address] ?? []
    if (!list.includes(origin)) all[address] = [...list, origin]
    await setItem(KEY, all)
  },
  async remove(address: string, origin: string): Promise<void> {
    const all = await load()
    all[address] = (all[address] ?? []).filter((o) => o !== origin)
    await setItem(KEY, all)
  },
}
