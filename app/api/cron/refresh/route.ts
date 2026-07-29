import { NextRequest, NextResponse } from 'next/server'
import { refreshAllProducts } from '@/lib/refresh'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summary = await refreshAllProducts()
  return NextResponse.json(summary)
}