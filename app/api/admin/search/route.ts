import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/aliexpress-api'

export async function GET(request: NextRequest) {
  const keywords = request.nextUrl.searchParams.get('q')
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)  
  if (!keywords) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 })
  }

  try {
    const data = await searchProducts(keywords, page)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}