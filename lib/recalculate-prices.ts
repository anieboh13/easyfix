import { prisma } from './prisma'
import { calculateFinalPrice } from './markup-engine'

// Recalculates every product's and every variant's finalPrice using their
// EXISTING basePrice — no AliExpress calls, so this is fast and safe to run
// any time a global/category markup rule or the shipping setting changes.
export async function recalculateAllPrices() {
  const products = await prisma.product.findMany({
    include: { variants: true },
  })

  let productsUpdated = 0
  let variantsUpdated = 0

  for (const product of products) {
    const finalPrice = await calculateFinalPrice(product.basePrice, {
      productId: product.id,
      categoryId: product.categoryId ?? undefined,
    })

    if (finalPrice !== product.finalPrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: { finalPrice },
      })
      productsUpdated++
    }

    for (const variant of product.variants) {
      const variantFinalPrice = await calculateFinalPrice(variant.basePrice, {
        productId: product.id,
        categoryId: product.categoryId ?? undefined,
      })

      if (variantFinalPrice !== variant.finalPrice) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { finalPrice: variantFinalPrice },
        })
        variantsUpdated++
      }
    }
  }

  return { productsUpdated, variantsUpdated }
}