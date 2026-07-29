import 'dotenv/config'
import { prisma } from './prisma'

async function main() {
  const deleted = await prisma.product.deleteMany({})
  console.log(`Deleted ${deleted.count} products (and their related images/price history)`)
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())