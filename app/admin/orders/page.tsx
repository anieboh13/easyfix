'use client'

import { useState, useEffect } from 'react'
import AdminNav from '../components/AdminNav'

interface OrderIntent {
  id: string
  productId: string | null
  productTitle: string
  variantId: string | null
  variantLabel: string | null
  price: number
  affiliateLink: string | null
  sourceUrl: string | null
  aliexpressSkuId: string | null
  whatsappNumber: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderIntent[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function fetchOrders(pageNum: number) {
    setLoading(true)
    const res = await fetch(`/api/admin/orders?page=${pageNum}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotalCount(data.totalCount || 0)
    setPage(data.page || 1)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders(1)
  }, [])

  function formatLocalTime(iso: string) {
    return new Date(iso).toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  async function copyLink(id: string, link: string) {
    await navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const pageSize = 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <span className="text-sm text-gray-500">{totalCount} total</span>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Variant</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">WhatsApp</th>
                <th className="text-left px-4 py-3">Trace back to AliExpress</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const traceLink = o.affiliateLink || o.sourceUrl

                return (
                  <tr key={o.id} className="border-t align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {formatLocalTime(o.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {o.productTitle.slice(0, 50)}
                      {o.productTitle.length > 50 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3">{o.variantLabel || '—'}</td>
                    <td className="px-4 py-3">₦{o.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${o.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {o.whatsappNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {traceLink ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={traceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs border px-2 py-1 rounded hover:bg-gray-50 inline-block w-fit"
                          >
                            {o.affiliateLink ? 'Open affiliate link' : 'Open source page'}
                          </a>
                          <button
                            onClick={() => copyLink(o.id, traceLink)}
                            className="text-xs text-gray-500 hover:text-gray-700 text-left"
                          >
                            {copiedId === o.id ? 'Copied!' : 'Copy link'}
                          </button>
                          {o.aliexpressSkuId && (
                            <span className="text-[11px] text-gray-400">
                              SKU: {o.aliexpressSkuId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No link saved</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No orders logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center justify-center">
            <button
              onClick={() => fetchOrders(page - 1)}
              disabled={page <= 1 || loading}
              className="border px-4 py-2 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchOrders(page + 1)}
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
