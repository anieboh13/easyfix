import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orderIntentRatelimit, getClientIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = await orderIntentRatelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 }
    )
  }

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

    // Basic shape check
    if (!productTitle || typeof price !== 'number' || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic sanity checks — rejects obviously malformed/abusive payloads
    // without needing to know every real product's exact price range.
    if (price <= 0 || price > 5_000_000) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }
    if (typeof productTitle !== 'string' || productTitle.length > 300) {
      return NextResponse.json({ error: 'Invalid product title' }, { status: 400 })
    }
    if (typeof whatsappNumber !== 'string' || !/^\d{10,15}$/.test(whatsappNumber)) {
      return NextResponse.json({ error: 'Invalid WhatsApp number' }, { status: 400 })
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