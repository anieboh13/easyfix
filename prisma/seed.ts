import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const category = await prisma.category.create({
    data: {
      name: 'Gadgets',
      slug: 'gadgets',
    },
  })

  const product = await prisma.product.create({
    data: {
      sourceUrl: 'https://www.aliexpress.com/item/example.html',
      sourceId: 'test-12345',
      title: 'Test Gadget',
      description: 'A placeholder product to confirm the schema works.',
      basePrice: 10.00,
      markupType: 'percent',
      markupValue: 30,
      finalPrice: 13.00,
      categoryId: category.id,
    },
  })

  console.log('Seeded category:', category)
  console.log('Seeded product:', product)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })