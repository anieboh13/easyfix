import { prisma } from './prisma'
import { refreshProductVariants } from './aliexpress-api'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function refreshAllProductVariants() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    select: { id: true, sourceId: true, categoryId: true },
  })

  const results: { id: string; success: boolean; action?: string; error?: string }[] = []

  for (const product of products) {
    let result = await refreshProductVariants(product)

    if (!result.success && result.action === 'skipped-temporary-error') {
      await delay(3000)
      result = await refreshProductVariants(product)
    }

    results.push({ id: product.id, ...result })
    await delay(2000)
  }

  return {
    totalProcessed: results.length,
    results,
  }
}