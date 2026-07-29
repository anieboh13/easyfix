import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'product-images'

export interface CachedImage {
  fullUrl: string
  thumbnailUrl: string
}

export async function cacheImage(sourceUrl: string, filename: string): Promise<CachedImage | null> {
  try {
    const response = await fetch(sourceUrl)
    if (!response.ok) {
      console.error(`Failed to download image: ${sourceUrl}`)
      return null
    }

    const originalBuffer = Buffer.from(await response.arrayBuffer())

    // Full-size image — re-encoded as JPEG for consistency, but not resized
    const fullBuffer = await sharp(originalBuffer).jpeg({ quality: 85 }).toBuffer()

    // Thumbnail — resized to 400px wide, keeping aspect ratio
    const thumbBuffer = await sharp(originalBuffer)
      .resize(400, 400, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer()

    const fullPath = `${filename}-full.jpg`
    const thumbPath = `${filename}-thumb.jpg`

    const [fullUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(BUCKET).upload(fullPath, fullBuffer, { contentType: 'image/jpeg', upsert: true }),
      supabase.storage.from(BUCKET).upload(thumbPath, thumbBuffer, { contentType: 'image/jpeg', upsert: true }),
    ])

    if (fullUpload.error || thumbUpload.error) {
      console.error('Supabase upload failed:', fullUpload.error || thumbUpload.error)
      return null
    }

    const fullUrl = supabase.storage.from(BUCKET).getPublicUrl(fullPath).data.publicUrl
    const thumbnailUrl = supabase.storage.from(BUCKET).getPublicUrl(thumbPath).data.publicUrl

    return { fullUrl, thumbnailUrl }
  } catch (err) {
    console.error('Image caching failed:', err)
    return null
  }
}