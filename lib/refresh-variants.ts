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

  const results: { id: string; success: boolean; action?: string; error?: string; variantCount?: number }[] = []

  for (const product of products) {
    let result = await refreshProductVariants(product)

    // If we hit a temporary error (e.g. rate limit), retry with increasing
    // waits before giving up — a single retry isn't always enough to
    // outlast AliExpress's rate-limit window.
    const retryDelays = [3000, 6000]
    for (const waitMs of retryDelays) {
      if (result.success || result.action !== 'skipped-temporary-error') break
      await delay(waitMs)
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