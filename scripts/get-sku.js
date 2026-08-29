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