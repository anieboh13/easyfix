import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      productId,
      productTitle,
      variantId,
      variantLabel,
      price,
      affiliateLink,
      sourceUrl,
      aliexpressSkuId,
      whatsappNumber,
    } = body

    if (!productTitle || typeof price !== 'number' || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const orderIntent = await prisma.orderIntent.create({
      data: {
        productId: productId ?? null,
        productTitle,
        variantId: variantId ?? null,
        variantLabel: variantLabel ?? null,
        price,
        affiliateLink: affiliateLink ?? null,
        sourceUrl: sourceUrl ?? null,
        aliexpressSkuId: aliexpressSkuId ?? null,
        whatsappNumber,
      },
    })

    return NextResponse.json({ id: orderIntent.id }, { status: 201 })
  } catch (err) {
    console.error('Failed to log order intent:', err)
    return NextResponse.json(
      { error: 'Failed to log order intent' },
      { status: 500 }
    )
  }
}