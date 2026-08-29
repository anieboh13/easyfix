'use client'

import { useState } from 'react'
import { formatNaira } from '@/lib/products'

type Variant = {
  id: string
  label: string
  finalPrice: number
  imageUrl: string | null
  affiliateLink: string | null
  aliexpressSkuId: string | null
}

export default function ProductOrderPanel({
  productId,
  sourceUrl,
  title,
  basePrice,
  variants,
  whatsappNumber,
}: {
  productId: string
  sourceUrl: string
  title: string
  basePrice: number
  variants: Variant[]
  whatsappNumber: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<{ url: string; label: string } | null>(null)
  const selected = variants.find((v) => v.id === selectedId) ?? null
  const displayPrice = selected ? selected.finalPrice : basePrice

  const whatsappMessage = encodeURIComponent(
    `Hi, I'd like to order: ${title}${
      selected ? ` (Color: ${selected.label})` : ''
    } (${formatNaira(displayPrice)})`
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  // Fire-and-forget: logs the click without delaying or blocking the
  // WhatsApp navigation (target="_blank" keeps this tab alive, so the
  // fetch completes normally even as the new tab opens).
  function logOrderIntent() {
    fetch('/api/order-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        productTitle: title,
        variantId: selected?.id ?? null,
        variantLabel: selected?.label ?? null,
        price: displayPrice,
        affiliateLink: selected?.affiliateLink ?? null,
        sourceUrl,
        aliexpressSkuId: selected?.aliexpressSkuId ?? null,
        whatsappNumber,
      }),
    }).catch((err) => {
      // Never let a logging failure block or alarm the customer.
      console.error('Failed to log order intent:', err)
    })
  }

  return (
    <div>
      <p className="mt-3 text-3xl font-extrabold text-[#22304A]">
        {formatNaira(displayPrice)}
      </p>

      {variants.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-[#8B93A1] uppercase tracking-wide mb-3">
            Choose an option ({variants.length} available)
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
                className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-colors ${
                  v.id === selectedId
                    ? 'border-[#22304A] border-2'
                    : 'border-[#EEF0F3]'
                }`}
              >
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#F4F5F7]">
                  {v.imageUrl && (
                    <>
                      <img
                        src={v.imageUrl}
                        alt={v.label}
                        className="w-full h-full object-cover"
                      />
                      <span
                        role="button"
                        aria-label={`View ${v.label} full screen`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setZoomedImage({ url: v.imageUrl!, label: v.label })
                        }}
                        className="absolute bottom-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <path d="M15 3h6v6" />
                          <path d="M9 21H3v-6" />
                          <path d="M21 3l-7 7" />
                          <path d="M3 21l7-7" />
                        </svg>
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-center text-[#5B6472] line-clamp-2">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
          {selected && (
            <p className="text-xs text-[#5B6472] mt-2">
              Selected: <span className="font-medium">{selected.label}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={logOrderIntent}
          className="text-center bg-[#22304A] text-white py-3.5 rounded-full font-semibold hover:bg-[#3d5f9d] transition-colors"
        >
          Order via WhatsApp
        </a>
        <p className="text-xs text-center text-[#8B93A1]">
          We&apos;ll confirm availability and delivery details with you directly.
        </p>
      </div>

      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
          <img
            src={zoomedImage.url}
            alt={zoomedImage.label}
            className="max-w-full max-h-full object-contain rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {zoomedImage.label}
          </p>
        </div>
      )}
    </div>
  )
}
