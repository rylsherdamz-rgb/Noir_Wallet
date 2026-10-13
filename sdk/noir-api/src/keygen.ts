/**
 * Creates an API key: prints the key once and appends only its hash to the
 * keys file. Usage: npm run keygen -- <name> [--scopes read,write,webhooks] [--rate 120] [--file keys.json]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { generateKey, SCOPES, type ApiKeyRecord, type Scope } from './keys.js'

const args = process.argv.slice(2)
const flag = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined }
const name = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!name) {
  console.error('usage: npm run keygen -- <name> [--scopes read,write,webhooks] [--rate 120] [--file keys.json]')
  process.exit(1)
}

const scopes = (flag('scopes') ?? 'read').split(',').map((s) => s.trim()) as Scope[]
const bad = scopes.filter((s) => !SCOPES.includes(s))
if (bad.length) { console.error(`unknown scope(s): ${bad.join(', ')} (use ${SCOPES.join(', ')})`); process.exit(1) }
const rate = flag('rate') ? Number(flag('rate')) : undefined
const file = flag('file') ?? process.env.NOIR_API_KEYS_FILE ?? './keys.json'

const { key, record } = generateKey(name, scopes, rate)
const existing: ApiKeyRecord[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
writeFileSync(file, JSON.stringify([...existing, record], null, 2) + '\n', { mode: 0o600 })

console.log(`Created key "${name}" (id ${record.id}, scopes ${scopes.join(',')}) in ${file}.`)
console.log('Copy it now; only its hash is stored:\n')
console.log(`  ${key}\n`)
