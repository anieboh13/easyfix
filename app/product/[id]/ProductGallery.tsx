'use client'

import { useState } from 'react'

type ProductImage = {
  id: string
  storageUrl: string
  thumbnailUrl: string | null
}

export default function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[]
  title: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-[#F4F5F7] shadow-sm" />
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div>
      {/* Main image — click to open lightbox */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block w-full aspect-square rounded-2xl overflow-hidden bg-[#F4F5F7] shadow-sm cursor-zoom-in"
      >
        <img
          src={selectedImage.storageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button
              type="button"
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden bg-[#F4F5F7] border transition-colors ${
                index === selectedIndex
                  ? 'border-[#22304A] border-2'
                  : 'border-[#EEF0F3]'
              }`}
            >
              <img
                src={img.thumbnailUrl || img.storageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={selectedImage.storageUrl}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}