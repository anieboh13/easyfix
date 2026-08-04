'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminNav from '../../components/AdminNav'

interface Product {
  id: string
  title: string
  description: string | null
  basePrice: number
  status: string
  hasCustomMarkup: boolean
  customMarkupType: string
  customMarkupValue: number
  finalPrice: number
  images: { storageUrl: string }[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [status, setStatus] = useState('active')
  const [useCustomMarkup, setUseCustomMarkup] = useState(false)
  const [markupType, setMarkupType] = useState('fixed')
  const [markupValue, setMarkupValue] = useState('')

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product
        setProduct(p)
        setTitle(p.title)
        setDescription(p.description || '')
        setBasePrice(p.basePrice.toString())
        setStatus(p.status)

        if (p.hasCustomMarkup) {
          setUseCustomMarkup(true)
          setMarkupType(p.customMarkupType)
          setMarkupValue(p.customMarkupValue.toString())
        }
      })
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const body: any = {
      title,
      description,
      basePrice: parseFloat(basePrice),
      status,
    }

    if (useCustomMarkup) {
      body.markupType = markupType
      body.markupValue = parseFloat(markupValue)
    } else {
      body.markupType = null
      body.markupValue = null
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (data.product) {
      setMessage('Saved successfully')
      setProduct(data.product)
    } else {
      setMessage('Save failed')
    }
    setSaving(false)
  }

  if (!product) return <div className="p-8">Loading...</div>

  return (
    <div>
      <AdminNav />
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="text-sm text-gray-600 border px-4 py-2 rounded hover:bg-gray-50"
          >
            ← Back to products
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 bg-white border rounded-lg p-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Base Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={useCustomMarkup}
                onChange={(e) => setUseCustomMarkup(e.target.checked)}
              />
              <span className="font-medium">
                Use custom markup for this product
              </span>
            </label>

            {useCustomMarkup && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Markup Type
                  </label>
                  <select
                    value={markupType}
                    onChange={(e) => setMarkupType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required={useCustomMarkup}
                  >
                    <option value="fixed">Fixed amount (₦)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Markup Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={markupValue}
                    onChange={(e) => setMarkupValue(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required={useCustomMarkup}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-gray-500">Current final price</p>
              <p className="text-xl font-bold">
                ₦{product.finalPrice.toLocaleString()}
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-800 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}