import 'dotenv/config'
import { searchProducts } from './aliexpress-api'

async function main() {
  const keywords = [
    'iphone lcd screen assembly',
    'samsung oled screen replacement',
    'phone screen digitizer assembly',
  ]

  for (const kw of keywords) {
    console.log(`\n=== "${kw}" ===`)
    const results = await searchProducts(kw)
    results.forEach((r, i) =>
      console.log(`${i}: ${r.title} — $${r.basePrice}`)
    )
  }
}

main()