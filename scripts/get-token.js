require('dotenv').config()

const CODE = '3_540506_L3lj2ia9vrXLsS7CIBAbje4b204'

async function main() {
  const { AffiliateClient } = await import('ae_sdk')

  const client = new AffiliateClient({
    app_key: '540506',
    app_secret: process.env.ALIEXPRESS_APP_SECRET,
  })

  const result = await client.generateToken({ code: CODE })
  console.log(JSON.stringify(result, null, 2))
}

main()