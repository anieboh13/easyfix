'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminNav from '../components/AdminNav'

interface Product {
  id: string
  title: string
  basePrice: number
  finalPrice: number
  status: string
  category: { name: string } | null
  images: { thumbnailUrl: string | null }[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchProducts(pageNum: number, status: string) {
    setLoading(true)
    const url = `/api/admin/products?page=${pageNum}${status ? `&status=${status}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setProducts(data.products || [])
    setTotalCount(data.totalCount || 0)
    setPage(data.page || 1)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts(1, statusFilter)
  }, [statusFilter])

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchProducts(page, statusFilter)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts(page, statusFilter)
  }

  const pageSize = 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="inactive">Inactive (delisted)</option>
          </select>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 w-16">Image</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Base Price</th>
                <th className="text-left px-4 py-3">Final Price</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    {p.images[0]?.thumbnailUrl && (
                      <img
                        src={p.images[0].thumbnailUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-blue-700 hover:underline font-medium"
                    >
                      {p.title.slice(0, 60)}
                      {p.title.length > 60 ? '...' : ''}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3">${p.basePrice}</td>
                  <td className="px-4 py-3">₦{p.finalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        p.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'inactive'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(p.id, p.status)}
                        className="text-xs border px-2 py-1 rounded hover:bg-gray-50"
                      >
                        {p.status === 'active' ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-xs border px-2 py-1 rounded text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center justify-center">
            <button
              onClick={() => fetchProducts(page - 1, statusFilter)}
              disabled={page <= 1 || loading}
              className="border px-4 py-2 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchProducts(page + 1, statusFilter)}
              disabled={page >= totalPages || loading}
              className="border px-4 py-2 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}