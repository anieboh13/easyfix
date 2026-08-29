// Debug utility: fetches and prints the raw AliExpress SKU/variant API
// response for a single product, so you can inspect exactly what
// AliExpress returns without digging through the full app.
//
// Uses the app's real getValidAccessToken() helper, so it always has a
// valid token automatically — no need to paste one in manually.
//
// Usage: edit product_id below to whatever you want to inspect, then run:
//   node scripts/get-sku.js

require('dotenv').config()
const { getValidAccessToken } = require('../lib/aliexpress-token')

async function main() {
  const { AffiliateClient } = await import('ae_sdk')
  const accessToken = await getValidAccessToken()

  const client = new AffiliateClient({
    app_key: process.env.ALIEXPRESS_APP_KEY,
    app_secret: process.env.ALIEXPRESS_APP_SECRET,
    session: accessToken,
  })

  const result = await client.callAPIDirectly('aliexpress.affiliate.product.sku.detail.get', {
    product_id: '1005012573930697',
    target_currency: 'USD',
    target_language: 'EN',
    ship_to_country: 'NG',
  })

  console.log(JSON.stringify(result, null, 2))
}

main()