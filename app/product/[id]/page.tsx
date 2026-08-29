import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import ProductGallery from './ProductGallery'
import ProductOrderPanel from './ProductOrderPanel'

// TODO: replace with your real WhatsApp number (with country code, no + or spaces)
// e.g. Nigerian number 0803 123 4567 becomes "2348031234567"
const WHATSAPP_NUMBER = '2349137971703'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
      <Link href="/" className="text-sm text-[#5B6472] hover:text-[#22304A] transition-colors">
        ← Back to all products
      </Link>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <span className="self-start bg-[#F4F5F7] text-[#5B6472] text-xs px-3 py-1 rounded-full mb-3">
              {product.category.name}
            </span>
          )}
          <h1 className="font-[family-name:var(--font-display)] font-bold text-2xl sm:text-3xl text-[#22304A]">
            {product.title}
          </h1>
          <p className="mt-6 text-sm text-[#5B6472] leading-relaxed">
            {product.description}
          </p>

          <ProductOrderPanel
            productId={product.id}
            sourceUrl={product.sourceUrl}
            title={product.title}
            basePrice={product.finalPrice}
            variants={product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              finalPrice: v.finalPrice,
              imageUrl: v.imageUrl,
              affiliateLink: v.affiliateLink,
              aliexpressSkuId: v.aliexpressSkuId,
            }))}
            whatsappNumber={WHATSAPP_NUMBER}
          />
        </div>
      </div>
    </section>
  )
}
