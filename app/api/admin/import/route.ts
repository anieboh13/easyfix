import { NextRequest, NextResponse } from 'next/server'
import { importFromSearchResult } from '@/lib/aliexpress-api'

export async function POST(request: NextRequest) {
  const body = await request.json()

  try {
    const result = await importFromSearchResult(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Import failed:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}