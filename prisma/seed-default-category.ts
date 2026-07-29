import { prisma } from '../lib/prisma'

async function main() {
  const existing = await prisma.category.findUnique({ where: { slug: 'uncategorized' } })
  if (!existing) {
    await prisma.category.create({
      data: { name: 'Uncategorized', slug: 'uncategorized' },
    })
    console.log('Created default category')
  } else {
    console.log('Default category already exists')
  }
}

main().finally(() => prisma.$disconnect())