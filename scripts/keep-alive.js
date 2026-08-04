const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('Keep-alive ping successful')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('Keep-alive ping failed:', err)
  process.exit(1)
})