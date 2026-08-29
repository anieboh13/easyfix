import { prisma } from './prisma'

export async function getProducts(options: { page?: number; categorySlug?: string; search?: string } = {}) {
  const page = options.page ?? 1
  const pageSize = 30

  const where: any = { status: 'active' }
  if (options.categorySlug) {
    where.category = { slug: options.categorySlug }
  }
  if (options.search) {
    where.title = { contains: options.search, mode: 'insensitive' }
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  return { products, totalCount, page, pageSize }
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id, status: 'active' },
    include: { images: true, category: true, variants: true },
  })
}