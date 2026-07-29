import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById, formatNaira } from '@/lib/products'
import ProductGallery from './ProductGallery'

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

  const whatsappMessage = encodeURIComponent(
    `Hi, I'd like to order: ${product.title} (${formatNaira(product.finalPrice)})`
  )
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

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
          <p className="mt-3 text-3xl font-extrabold text-[#22304A]">
            {formatNaira(product.finalPrice)}
          </p>

          <p className="mt-6 text-sm text-[#5B6472] leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-[#22304A] text-white py-3.5 rounded-full font-semibold hover:bg-[#3d5f9d] transition-colors"
            >
              Order via WhatsApp
            </a>
            <p className="text-xs text-center text-[#8B93A1]">
              We&apos;ll confirm availability and delivery details with you directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}