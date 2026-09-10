import { prisma } from './prisma'
import { getEffectiveRate } from './exchange-rate'

const EXCHANGE_RATE = parseFloat(process.env.USD_TO_NGN_RATE || '1550')

interface MarkupContext {
  productId?: string
  categoryId?: string
}

// Looks for a markup rule in priority order: product-specific → category → global.
// Falls back to a flat ₦20,000 if nothing is configured yet.
async function getApplicableMarkupRule(context: MarkupContext) {
  if (context.productId) {
    const productRule = await prisma.markupRule.findFirst({
      where: { scope: 'product', scopeId: context.productId },
    })
    if (productRule) return productRule
  }

  if (context.categoryId) {
    const categoryRule = await prisma.markupRule.findFirst({
      where: { scope: 'category', scopeId: context.categoryId },
    })
    if (categoryRule) return categoryRule
  }

  const globalRule = await prisma.markupRule.findFirst({
    where: { scope: 'global' },
  })
  if (globalRule) return globalRule

  // Hardcoded fallback if no rules exist at all yet
  return { type: 'fixed', value: 20000 }
}

// Converts a USD base price to Naira and applies the markup rule.
export async function calculateFinalPrice(
  basePriceUSD: number,
  context: MarkupContext = {}
): Promise<number> {
  const exchangeRate = await getEffectiveRate()
  const basePriceNaira = basePriceUSD * exchangeRate
  const rule = await getApplicableMarkupRule(context)

  let finalPrice: number
  if (rule.type === 'percent') {
    finalPrice = basePriceNaira * (1 + rule.value / 100)
  } else {
    finalPrice = basePriceNaira + rule.value
  }

  // Round to a "clean-looking" price — nearest 100, minus 100
  // e.g. 34,210 → 34,200 → 34,100 (a common psychological pricing pattern)
  const roundedUp = Math.ceil(finalPrice / 100) * 100
  return roundedUp - 100
}