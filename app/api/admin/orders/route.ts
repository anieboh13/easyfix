import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const [orders, totalCount] = await Promise.all([
    prisma.orderIntent.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.orderIntent.count(),
  ])

  return NextResponse.json({ orders, totalCount, page })
}
