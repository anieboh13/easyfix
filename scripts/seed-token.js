require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const CODE = '3_540506_hDQ0cIA6T713TeerKaHDx0hL80'

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