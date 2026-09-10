import { prisma } from './prisma'

// Free, no-API-key endpoint (ExchangeRate-API "open" tier).
// Returns: { result, base_code, rates: { NGN, ... }, time_last_update_unix, ... }
const RATE_API_URL = 'https://open.er-api.com/v6/latest/USD'

// Sanity bounds — reject any fetched rate outside this range so a bad or
// unexpected API response can never poison your prices. Widen if the naira
// ever moves outside this.
const MIN_PLAUSIBLE_RATE = 500
const MAX_PLAUSIBLE_RATE = 5000

// Used only if no ExchangeRate row exists yet AND no live fetch has succeeded.
// Matches the old static behaviour.
const FALLBACK_RATE = parseFloat(process.env.USD_TO_NGN_RATE || '1550')
const DEFAULT_BUFFER_PCT = 5

// --- tiny in-memory cache (per serverless instance) ----------------------
// calculateFinalPrice() runs once per product/variant inside the refresh
// loop; this avoids hitting the DB on every single call within one run.
let cache: { rate: number; bufferPct: number; at: number } | null = null
const CACHE_TTL_MS = 60_000

function setCache(rate: number, bufferPct: number) {
  cache = { rate, bufferPct, at: Date.now() }
}

export function clearRateCache() {
  cache = null
}

async function readStoredRate(): Promise<{ rate: number; bufferPct: number }> {
  const row = await prisma.exchangeRate.findUnique({ where: { id: 'singleton' } })
  if (row) return { rate: row.rate, bufferPct: row.bufferPct }
  return { rate: FALLBACK_RATE, bufferPct: DEFAULT_BUFFER_PCT }
}

// The rate actually used for pricing = official rate + buffer%.
export async function getEffectiveRate(): Promise<number> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.rate * (1 + cache.bufferPct / 100)
  }
  const { rate, bufferPct } = await readStoredRate()
  setCache(rate, bufferPct)
  return rate * (1 + bufferPct / 100)
}

// Full current state, for the admin view.
export async function getRateInfo() {
  const row = await prisma.exchangeRate.findUnique({ where: { id: 'singleton' } })
  const rate = row?.rate ?? FALLBACK_RATE
  const bufferPct = row?.bufferPct ?? DEFAULT_BUFFER_PCT
  return {
    rate,
    bufferPct,
    effectiveRate: rate * (1 + bufferPct / 100),
    source: row?.source ?? 'default (no live fetch yet)',
    fetchedAt: row?.fetchedAt ?? null,
    isLive: !!row,
  }
}

// Fetches the live official USD→NGN rate. Throws on failure or implausible value.
export async function fetchLiveRate(): Promise<number> {
  const res = await fetch(RATE_API_URL, {
    cache: 'no-store', // never let Next cache the FX response
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Rate API HTTP ${res.status}`)

  const data = await res.json()
  if (data?.result !== 'success') {
    throw new Error(`Rate API returned result="${data?.result}"`)
  }

  const ngn = Number(data?.rates?.NGN)
  if (!Number.isFinite(ngn)) {
    throw new Error('Rate API response had no numeric NGN rate')
  }
  if (ngn < MIN_PLAUSIBLE_RATE || ngn > MAX_PLAUSIBLE_RATE) {
    throw new Error(
      `Fetched NGN rate ${ngn} is outside the plausible range ${MIN_PLAUSIBLE_RATE}-${MAX_PLAUSIBLE_RATE}`
    )
  }
  return ngn
}

// Fetches the live rate and stores it (preserving the existing buffer).
// Throws if the fetch fails — the caller decides whether that aborts its job.
export async function updateExchangeRate(): Promise<{ rate: number; bufferPct: number }> {
  const rate = await fetchLiveRate()
  const existing = await prisma.exchangeRate.findUnique({ where: { id: 'singleton' } })
  const bufferPct = existing?.bufferPct ?? DEFAULT_BUFFER_PCT

  await prisma.exchangeRate.upsert({
    where: { id: 'singleton' },
    update: { rate, source: 'open.er-api.com', fetchedAt: new Date() },
    create: { id: 'singleton', rate, bufferPct, source: 'open.er-api.com' },
  })

  clearRateCache()
  setCache(rate, bufferPct)
  return { rate, bufferPct }
}

// Admin: update the buffer % (clamped 0–100).
export async function setBufferPct(bufferPct: number) {
  const clamped = Math.max(0, Math.min(100, bufferPct))
  await prisma.exchangeRate.upsert({
    where: { id: 'singleton' },
    update: { bufferPct: clamped },
    create: { id: 'singleton', rate: FALLBACK_RATE, bufferPct: clamped, source: 'default' },
  })
  clearRateCache()
  return clamped
}

// Admin: manually pin the official rate (e.g. to match the parallel market).
// NOTE: the next automatic refresh will overwrite this with the live rate.
export async function setManualRate(rate: number) {
  const existing = await prisma.exchangeRate.findUnique({ where: { id: 'singleton' } })
  const bufferPct = existing?.bufferPct ?? DEFAULT_BUFFER_PCT
  await prisma.exchangeRate.upsert({
    where: { id: 'singleton' },
    update: { rate, source: 'manual', fetchedAt: new Date() },
    create: { id: 'singleton', rate, bufferPct, source: 'manual' },
  })
  clearRateCache()
  return rate
}