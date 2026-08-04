import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminNav from './components/AdminNav'

export default async function AdminDashboard() {
  const totalProducts = await prisma.product.count()
  const activeProducts = await prisma.product.count({ where: { status: 'active' } })
  const hiddenProducts = await prisma.product.count({ where: { status: 'hidden' } })
  const lastRefresh = await prisma.product.aggregate({ _max: { lastCheckedAt: true } })
  const recentProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { category: true },
  })

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-500">Hidden</p>
            <p className="text-3xl font-bold text-gray-400">{hiddenProducts}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Last Refresh</p>
          <p className="text-lg font-medium">
            {lastRefresh._max.lastCheckedAt
              ? new Date(lastRefresh._max.lastCheckedAt).toLocaleString()
              : 'Never'}
          </p>
        </div>

        <h2 className="text-lg font-bold mb-4">Recently Imported</h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {p.title.slice(0, 50)}
                      {p.title.length > 50 ? '...' : ''}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        p.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}