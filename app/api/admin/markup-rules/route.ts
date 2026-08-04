import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rules = await prisma.markupRule.findMany({
    orderBy: [{ scope: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ rules })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rule = await prisma.markupRule.create({
    data: {
      scope: body.scope,
      scopeId: body.scopeId || null,
      type: body.type,
      value: body.value,
    },
  })
  return NextResponse.json({ rule })
}