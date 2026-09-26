import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFinalPrice } from '@/lib/markup-engine'
import { setProductShippingOverride, clearProductShippingOverride } from '@/lib/shipping'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const hasCustomMarkup = await prisma.markupRule.findFirst({
    where: { scope: 'product', scopeId: id },
  })

  const shippingOverride = await prisma.productShippingOverride.findUnique({
    where: { productId: id },
  })

  return NextResponse.json({
    product: {
      ...product,
      hasCustomMarkup: !!hasCustomMarkup,
      customMarkupType: hasCustomMarkup?.type || '',
      customMarkupValue: hasCustomMarkup?.value || 0,
      hasShippingOverride: !!shippingOverride,
      shippingOverrideType: shippingOverride?.type || '',
      shippingOverrideValue: shippingOverride?.value || 0,
    },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const updateData: any = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.basePrice !== undefined) updateData.basePrice = body.basePrice
  if (body.status !== undefined) updateData.status = body.status

  // Handle per-product markup override via MarkupRule table
  if (body.markupType !== undefined) {
    await prisma.markupRule.deleteMany({
      where: { scope: 'product', scopeId: id },
    })

    if (body.markupType && body.markupValue !== null && body.markupValue !== undefined) {
      await prisma.markupRule.create({
        data: {
          scope: 'product',
          scopeId: id,
          type: body.markupType,
          value: body.markupValue,
        },
      })
      updateData.markupType = body.markupType
      updateData.markupValue = body.markupValue
    }
  }

  // Handle per-product shipping override
  if (body.shippingType !== undefined) {
    if (body.shippingType && body.shippingValue !== null && body.shippingValue !== undefined) {
      await setProductShippingOverride(id, body.shippingType, body.shippingValue)
    } else {
      await clearProductShippingOverride(id)
    }
  }

  // Recalculate final price if basePrice, markup, or shipping changed
  if (
    updateData.basePrice !== undefined ||
    body.markupType !== undefined ||
    body.shippingType !== undefined
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
    if (product) {
      const basePrice = updateData.basePrice ?? product.basePrice
      const finalPrice = await calculateFinalPrice(basePrice, {
        productId: id,
        categoryId: product.categoryId ?? undefined,
      })
      updateData.finalPrice = finalPrice
    }
  }

    const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { images: true, category: true },
  })

  // If markup or shipping changed, existing variants need their prices
  // recalculated too — otherwise they'd silently lag behind until the
  // next scheduled refresh.
  if (body.markupType !== undefined || body.shippingType !== undefined) {
    const variants = await prisma.productVariant.findMany({ where: { productId: id } })
    for (const v of variants) {
      const newFinalPrice = await calculateFinalPrice(v.basePrice, {
        productId: id,
        categoryId: updated.categoryId ?? undefined,
      })
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { finalPrice: newFinalPrice },
      })
    }
  }

  return NextResponse.json({ product: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}