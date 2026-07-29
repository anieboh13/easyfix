import { prisma } from './prisma'
import { refreshProduct } from './aliexpress-api'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function refreshAllProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    select: { id: true, sourceId: true, categoryId: true, finalPrice: true },
  })

  const results: { id: string; success: boolean; action?: string; error?: string }[] = []

  for (const product of products) {
    try {
      const result = await refreshProduct(product)
      results.push({ id: product.id, success: true, action: result.action })
    } catch (err) {
      results.push({ id: product.id, success: false, error: String(err) })
    }
    await delay(1000) // one request per second, safely under AliExpress's rate limit
  }

  return {
    totalProcessed: results.length,
    results,
  }
}