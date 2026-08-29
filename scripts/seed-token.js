// One-time setup script: exchanges an AliExpress OAuth authorization code
// for an access/refresh token pair, and saves it to the AliexpressToken
// table so the app can start making authenticated API calls.
//
// You only need to run this once per app authorization. Re-run it if:
//   - You're setting up the project fresh on a new machine/database
//   - AliExpress revokes access and you need to re-authorize
//   - You switch to different AliExpress app credentials
//
// To get a fresh CODE:
//   1. Visit AliExpress's OAuth authorize URL for your app (see the
//      AliExpress Open Platform console for your app's authorize link)
//   2. Log in and approve access
//   3. You'll be redirected to your configured redirect_uri with a
//      `?code=...` query param — copy that value in below
//   4. Run: node scripts/seed-token.js
//
// Note: the code is single-use and expires quickly (minutes), so grab
// a fresh one right before running this rather than saving it for later.

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const CODE = 'PASTE_A_FRESH_CODE_HERE'

async function main() {
  const { AffiliateClient } = await import('ae_sdk')
  const prisma = new PrismaClient()

  const client = new AffiliateClient({
    app_key: process.env.ALIEXPRESS_APP_KEY,
    app_secret: process.env.ALIEXPRESS_APP_SECRET,
  })

  const result = await client.generateToken({ code: CODE })

  if (!result.ok) {
    console.error('Failed to generate token:', JSON.stringify(result, null, 2))
    process.exit(1)
  }

  const data = result.data
  const expiresAt = new Date(Date.now() + data.expires_in * 1000)

  await prisma.aliexpressToken.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    },
  })

  console.log('Token saved successfully. Expires at:', expiresAt.toISOString())
  await prisma.$disconnect()
}

main()