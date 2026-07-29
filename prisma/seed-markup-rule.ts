import { prisma } from '../lib/prisma'

async function main() {
  const existing = await prisma.markupRule.findFirst({ where: { scope: 'global' } })
  if (existing) {
    console.log('Global markup rule already exists:', existing)
    return
  }

  const rule = await prisma.markupRule.create({
    data: {
      scope: 'global',
      type: 'fixed',
      value: 20000,
    },
  })
  console.log('Created global markup rule:', rule)
}

main().finally(() => prisma.$disconnect())
