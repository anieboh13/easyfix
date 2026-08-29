import { createHmac } from 'crypto'
import { prisma } from './prisma'

const APP_KEY = process.env.ALIEXPRESS_APP_KEY!
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET!

// Refresh a bit before actual expiry, so we never get caught out mid-request
const REFRESH_BUFFER_MS = 30 * 60 * 1000 // 30 minutes

const AE_OP_API_URL = 'https://api-sg.aliexpress.com/rest'
const REFRESH_METHOD = '/auth/token/refresh'

// Mirrors ae_sdk's internal AEBaseClient.sign(), minus the bogus empty
// `session` param it always injects (which breaks this specific endpoint —
// you don't have a session yet, that's the whole point of refreshing).
function signParams(method: string, params: Record<string, unknown>, appSecret: string): string {
  let basestring = method
  basestring += Object.entries(params)
    .filter(([, value]) => value != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => acc + key + String(value), '')
  return createHmac('sha256', appSecret, { encoding: 'utf-8' })
    .update(basestring)
    .digest('hex')
    .toUpperCase()
}

async function refreshViaDirectApi(refreshToken: string) {
  const params: Record<string, unknown> = {
    app_key: APP_KEY,
    refresh_token: refreshToken,
    sign_method: 'sha256',
    timestamp: Date.now(),
  }
  const sign = signParams(REFRESH_METHOD, params, APP_SECRET)

  const query = Object.entries({ ...params, sign })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value], i) => `${i === 0 ? '?' : '&'}${key}=${encodeURIComponent(String(value))}`)
    .join('')

  const res = await fetch(`${AE_OP_API_URL}${REFRESH_METHOD}${query}`, { method: 'POST' })
  const data = await res.json()

  console.log('AliExpress refresh result:', JSON.stringify(data, null, 2))

  if (!res.ok || data.error_response || (data.code && data.code !== '0')) {
    throw new Error(
      `Failed to refresh AliExpress token: ${JSON.stringify(data)}. You may need to re-run scripts/seed-token.js.`
    )
  }

  return data as {
    access_token: string
    refresh_token: string
    expires_in: number
  }
}

export async function getValidAccessToken(): Promise<string> {
  const record = await prisma.aliexpressToken.findUnique({
    where: { id: 'singleton' },
  })

  if (!record) {
    throw new Error(
      'No AliExpress token found. Run scripts/seed-token.js once to authorize this app.'
    )
  }

  const needsRefresh = record.expiresAt.getTime() - REFRESH_BUFFER_MS < Date.now()

  if (!needsRefresh) {
    return record.accessToken
  }

  const data = await refreshViaDirectApi(record.refreshToken)
  const expiresAt = new Date(Date.now() + data.expires_in * 1000)

  const updated = await prisma.aliexpressToken.update({
    where: { id: 'singleton' },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
  })

  return updated.accessToken
}