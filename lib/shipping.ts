import { prisma } from './prisma'

export interface ShippingInfo {
  type: 'fixed' | 'percent'
  value: number
}

// Global (site-wide) setting — used when a product has no override.
export async function getShippingSetting(): Promise<ShippingInfo> {
  const record = await prisma.shippingSetting.findUnique({
    where: { id: 'singleton' },
  })

  if (!record) {
    return { type: 'fixed', value: 0 }
  }

  return { type: record.type as 'fixed' | 'percent', value: record.value }
}

export async function setShippingSetting(type: 'fixed' | 'percent', value: number) {
  return prisma.shippingSetting.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', type, value },
    update: { type, value },
  })
}

// Resolves the shipping setting that actually applies to a given product:
// its own override if one exists, otherwise the global setting.
export async function getShippingSettingForProduct(
  productId?: string
): Promise<ShippingInfo> {
  if (productId) {
    const override = await prisma.productShippingOverride.findUnique({
      where: { productId },
    })
    if (override) {
      return { type: override.type as 'fixed' | 'percent', value: override.value }
    }
  }

  return getShippingSetting()
}

export async function setProductShippingOverride(
  productId: string,
  type: 'fixed' | 'percent',
  value: number
) {
  return prisma.productShippingOverride.upsert({
    where: { productId },
    create: { productId, type, value },
    update: { type, value },
  })
}

export async function clearProductShippingOverride(productId: string) {
  return prisma.productShippingOverride.deleteMany({ where: { productId } })
}

// Applies the shipping buffer to a Naira base price BEFORE markup, so the
// markup is calculated on the true landed cost, not just the item price.
export function applyShippingBuffer(basePriceNaira: number, shipping: ShippingInfo): number {
  if (shipping.type === 'percent') {
    return basePriceNaira * (1 + shipping.value / 100)
  }
  return basePriceNaira + shipping.value
}