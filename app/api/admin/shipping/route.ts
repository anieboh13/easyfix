import { NextRequest, NextResponse } from 'next/server'
import { getShippingSetting, setShippingSetting } from '@/lib/shipping'
import { recalculateAllPrices } from '@/lib/recalculate-prices'

export async function GET() {
  const setting = await getShippingSetting()
  return NextResponse.json(setting)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (
    (body.type !== 'fixed' && body.type !== 'percent') ||
    typeof body.value !== 'number' ||
    body.value < 0
  ) {
    return NextResponse.json({ error: 'Invalid shipping setting' }, { status: 400 })
  }

  const updated = await setShippingSetting(body.type, body.value)
  const recalc = await recalculateAllPrices()

  return NextResponse.json({ ...updated, recalculated: recalc })
}