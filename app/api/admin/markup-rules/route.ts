import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalculateAllPrices } from '@/lib/recalculate-prices'

export async function GET() {
  const rules = await prisma.markupRule.findMany({
    orderBy: [{ scope: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ rules })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const scopeId = body.scope === 'category' ? body.scopeId || null : null

  // A given scope (global, or a specific category) should only ever have
  // ONE active rule — otherwise which one applies is ambiguous. Replace
  // any existing rule for this exact scope before creating the new one.
  await prisma.markupRule.deleteMany({
    where: { scope: body.scope, scopeId },
  })

  const rule = await prisma.markupRule.create({
    data: {
      scope: body.scope,
      scopeId,
      type: body.type,
      value: body.value,
    },
  })

  const recalculated = await recalculateAllPrices()

  return NextResponse.json({ rule, recalculated })
}