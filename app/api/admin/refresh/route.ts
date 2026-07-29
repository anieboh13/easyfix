import { NextResponse } from 'next/server'
import { refreshAllProducts } from '@/lib/refresh'

export async function POST() {
  const summary = await refreshAllProducts()
  return NextResponse.json(summary)
}