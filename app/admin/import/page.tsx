'use client'

import { useState } from 'react'
import AdminNav from '../components/AdminNav'

interface SearchResult {
  sourceId: string
  sourceUrl: string
  title: string
  description: string
  basePrice: number
  imageUrls: string[]
  commissionRate: string
  category: string
}

const PAGE_SIZE = 20

export default function ImportPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [statusMessage, setStatusMessage] = useState('')

  async function runSearch(searchQuery: string, pageNum: number) {
    setLoading(true)
    setStatusMessage('')
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`
      )
      const data = await res.json()
      setResults(data.results || [])
      setTotalCount(data.totalCount || 0)
      setPage(pageNum)
    } catch {
      setStatusMessage('Search failed. Check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    runSearch(query, 1)
  }

  async function handleImport(product: SearchResult) {
    setStatusMessage(`Importing "${product.title.slice(0, 40)}..."`)
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const data = await res.json()

      if (data.success) {
        setImportedIds((prev) => new Set(prev).add(product.sourceId))
        setStatusMessage(`Imported: ${product.title.slice(0, 40)}...`)
      } else {
        setStatusMessage(`Skipped: ${data.error}`)
      }
    } catch {
      setStatusMessage('Import failed. Check the console for details.')
    }
  }

  const totalPages = Math.min(Math.ceil(totalCount / PAGE_SIZE), 100) // AliExpress caps how deep you can page

    return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Import Products</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AliExpress, e.g. iphone lcd screen assembly"
          className="flex-1 border rounded px-4 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {totalCount > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {totalCount.toLocaleString()} results — page {page} of {totalPages.toLocaleString()}
        </p>
      )}

      {statusMessage && (
        <p className="mb-4 text-sm text-gray-600">{statusMessage}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {results.map((product) => {
          const alreadyImported = importedIds.has(product.sourceId)
          return (
            <div key={product.sourceId} className="border rounded-lg p-3 flex flex-col">
              {product.imageUrls[0] && (
                <img
                  src={product.imageUrls[0]}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm font-medium line-clamp-2 mb-1">{product.title}</p>
              <p className="text-sm text-gray-500 mb-2">
                ${product.basePrice} · {product.category}
              </p>
              <button
                onClick={() => handleImport(product)}
                disabled={alreadyImported}
                className="mt-auto bg-green-700 text-white text-sm py-1.5 rounded disabled:opacity-50"
              >
                {alreadyImported ? 'Imported ✓' : 'Import this product'}
              </button>
            </div>
          )
        })}
      </div>

      {results.length > 0 && (
        <div className="flex gap-2 items-center justify-center">
          <button
            onClick={() => runSearch(query, page - 1)}
            disabled={page <= 1 || loading}
            className="border px-4 py-2 rounded disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => runSearch(query, page + 1)}
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