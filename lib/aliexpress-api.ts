import crypto from 'crypto'
import { calculateFinalPrice } from './markup-engine'
import { cacheImage } from './image-storage'

const API_URL = 'https://api-sg.aliexpress.com/sync'
const APP_KEY = process.env.ALIEXPRESS_APP_KEY!
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET!
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID!

// AliExpress requires every request to be "signed" — proof the request
// really came from you and wasn't tampered with. It works like this:
// 1. Sort all params alphabetically by key
// 2. Concatenate them into one string: key1value1key2value2...
// 3. Wrap that string with your app secret on both ends
// 4. MD5-hash it, uppercase the result — that's the `sign` param
function signRequest(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], '')

  const wrapped = `${APP_SECRET}${sorted}${APP_SECRET}`

  return crypto.createHash('md5').update(wrapped, 'utf8').digest('hex').toUpperCase()
}

// AliExpress wants timestamps in China's timezone, formatted as
// "YYYY-MM-DD HH:mm:ss" — this converts the current time correctly
// without needing an extra date library.
function getChinaTimestamp(): string {
  const now = new Date()
  const chinaTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
  )
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${chinaTime.getFullYear()}-${pad(chinaTime.getMonth() + 1)}-${pad(
    chinaTime.getDate()
  )} ${pad(chinaTime.getHours())}:${pad(chinaTime.getMinutes())}:${pad(
    chinaTime.getSeconds()
  )}`
}

// The shape we want, matching your Prisma Product model
export interface NormalizedProduct {
  sourceId: string
  sourceUrl: string
  title: string
  description: string
  basePrice: number
  imageUrls: string[]
}

export async function fetchProductDetails(
  productId: string
): Promise<NormalizedProduct | null> {
  const baseParams: Record<string, string> = {
    app_key: APP_KEY,
    method: 'aliexpress.affiliate.productdetail.get',
    sign_method: 'md5',
    timestamp: getChinaTimestamp(),
    format: 'json',
    v: '2.0',
    product_ids: productId,
    target_currency: 'USD',
    target_language: 'EN',
    tracking_id: TRACKING_ID,
  }

  const sign = signRequest(baseParams)
  const allParams = { ...baseParams, sign }

  console.log('Sending params:', allParams)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams(allParams),
  })

  const data = await response.json()
  console.log(JSON.stringify(data, null, 2))

  const result =
    data?.aliexpress_affiliate_productdetail_get_response?.resp_result?.result
      ?.products?.product?.[0]

  if (!result) {
    console.error('No product found in AliExpress response:', data)
    return null
  }

  return {
    sourceId: String(result.product_id),
    sourceUrl: result.product_detail_url,
    title: result.product_title,
    description: result.product_title,
    basePrice: parseFloat(result.target_sale_price),
    imageUrls: result.product_small_image_urls?.string ?? [],
  }


}

export interface SearchResult extends NormalizedProduct {
  commissionRate: string
  category: string
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  currentPage: number
}

export async function searchProducts(
  keywords: string,
  page: number = 1
): Promise<SearchResponse> {
  const baseParams: Record<string, string> = {
    app_key: APP_KEY,
    method: 'aliexpress.affiliate.product.query',
    sign_method: 'md5',
    timestamp: getChinaTimestamp(),
    format: 'json',
    v: '2.0',
    keywords,
    target_currency: 'USD',
    target_language: 'EN',
    tracking_id: TRACKING_ID,
    page_size: '20',
    page_no: String(page),
  }

  const sign = signRequest(baseParams)
  const allParams = { ...baseParams, sign }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams(allParams),
  })

  const data = await response.json()
  const result = data?.aliexpress_affiliate_product_query_response?.resp_result?.result
  const products = result?.products?.product ?? []

  const results: SearchResult[] = products.map((p: any) => ({
    sourceId: String(p.product_id),
    sourceUrl: p.product_detail_url,
    title: p.product_title,
    description: p.product_title,
    basePrice: parseFloat(p.target_sale_price),
    imageUrls: p.product_small_image_urls?.string ?? [],
    commissionRate: p.commission_rate,
    category: p.first_level_category_name,
  }))

  return {
    results,
    totalCount: result?.total_record_count ?? 0,
    currentPage: page,
  }
}

export async function importFromSearchResult(result: SearchResult) {
  return saveProduct(result)
}
export function extractProductId(url: string): string | null {
  const match = url.match(/\/item\/(\d+)\.html/)
  return match ? match[1] : null
}

import { prisma } from './prisma'

async function saveProduct(details: NormalizedProduct) {
  const existing = await prisma.product.findUnique({ where: { sourceId: details.sourceId } })
  if (existing) {
    return { success: false, error: 'Product already imported', product: existing }
  }
  const cachedImages: { fullUrl: string; thumbnailUrl: string }[] = []
  for (let i = 0; i < details.imageUrls.length; i++) {
    const cached = await cacheImage(details.imageUrls[i], `${details.sourceId}-${i}`)
    if (cached) cachedImages.push(cached)
  }

  const category = await prisma.category.findUnique({ where: { slug: 'uncategorized' } })
  const finalPrice = await calculateFinalPrice(details.basePrice, { categoryId: category?.id })
 
  const product = await prisma.product.create({
    data: {
      sourceUrl: details.sourceUrl,
      sourceId: details.sourceId,
      title: details.title,
      description: details.description,
      basePrice: details.basePrice,
      markupType: 'fixed',
      markupValue: 20000,
      finalPrice: finalPrice,
      categoryId: category?.id,
      images: {
        create: cachedImages.map((img) => ({
          storageUrl: img.fullUrl,
          thumbnailUrl: img.thumbnailUrl,
        })),
      },
    },
    include: { images: true },
  })

  return { success: true, product }
}

export async function importProduct(url: string) {
  const productId = extractProductId(url)
  if (!productId) {
    return { success: false, error: 'Could not extract a product ID from that URL' }
  }

  const details = await fetchProductDetails(productId)
  if (!details) {
    return { success: false, error: 'AliExpress API returned no data for this product — it may not be affiliate-enrolled' }
  }

  return saveProduct(details)
}

export async function refreshProduct(product: {
  id: string
  sourceId: string
  categoryId: string | null
  finalPrice: number
}) {
  const details = await fetchProductDetails(product.sourceId)

  if (!details) {
    // AliExpress no longer returns this product — likely delisted by the seller
    await prisma.product.update({
      where: { id: product.id },
      data: { status: 'inactive', lastCheckedAt: new Date() },
    })
    return { success: true, action: 'marked-inactive' as const }
  }

  const finalPrice = await calculateFinalPrice(details.basePrice, {
    categoryId: product.categoryId ?? undefined,
  })

  // Log the price that's about to be replaced, so PriceHistory keeps a trail
  await prisma.priceHistory.create({
    data: { productId: product.id, price: product.finalPrice },
  })

  // Re-cache fresh images from AliExpress
  const cachedImages: { fullUrl: string; thumbnailUrl: string }[] = []
  for (let i = 0; i < details.imageUrls.length; i++) {
    const cached = await cacheImage(details.imageUrls[i], `${product.sourceId}-${i}-${Date.now()}`)
    if (cached) cachedImages.push(cached)
  }

  await prisma.productImage.deleteMany({ where: { productId: product.id } })

  await prisma.product.update({
    where: { id: product.id },
    data: {
      title: details.title,
      basePrice: details.basePrice,
      finalPrice,
      status: 'active',
      lastCheckedAt: new Date(),
      images: {
        create: cachedImages.map((img) => ({
          storageUrl: img.fullUrl,
          thumbnailUrl: img.thumbnailUrl,
        })),
      },
    },
  })

  return { success: true, action: 'updated' as const }
}