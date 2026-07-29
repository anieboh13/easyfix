import 'dotenv/config'
import { prisma } from './prisma'

async function main() {
  const product = await prisma.product.findUnique({
    where: { sourceId: '1005006411474600' },
  })

  if (!product) {
    console.log('Product not found — may already be deleted')
    return
  }

  await prisma.productImage.deleteMany({
    where: { productId: product.id },
  })

  const deleted = await prisma.product.delete({
    where: { id: product.id },
  })

  console.log('Deleted:', deleted.title)
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())