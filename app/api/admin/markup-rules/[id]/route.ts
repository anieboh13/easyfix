import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalculateAllPrices } from '@/lib/recalculate-prices'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.markupRule.delete({ where: { id } })

  const recalculated = await recalculateAllPrices()

  return NextResponse.json({ success: true, recalculated })
}