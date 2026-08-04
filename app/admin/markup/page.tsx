'use client'

import { useState, useEffect } from 'react'
import AdminNav from '../components/AdminNav'

interface MarkupRule {
  id: string
  scope: string
  scopeId: string | null
  type: string
  value: number
}

interface Category {
  id: string
  name: string
}

export default function MarkupRulesPage() {
  const [rules, setRules] = useState<MarkupRule[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const [scope, setScope] = useState('global')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState('fixed')
  const [value, setValue] = useState('')

  useEffect(() => {
    fetchRules()
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
  }, [])

  async function fetchRules() {
    const res = await fetch('/api/admin/markup-rules')
    const data = await res.json()
    setRules(data.rules || [])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body: any = { scope, type, value: parseFloat(value) }
    if (scope === 'category') body.scopeId = categoryId

    await fetch('/api/admin/markup-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setValue('')
    setCategoryId('')
    fetchRules()
    setLoading(false)
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this rule?')) return
    await fetch(`/api/admin/markup-rules/${id}`, { method: 'DELETE' })
    fetchRules()
  }

  const globalRules = rules.filter((r) => r.scope === 'global')
  const categoryRules = rules.filter((r) => r.scope === 'category')
  const productRules = rules.filter((r) => r.scope === 'product')

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Markup Rules</h1>

        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="font-bold mb-4">Add New Rule</h2>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="global">Global</option>
                <option value="category">Category</option>
              </select>
            </div>

            {scope === 'category' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="fixed">Fixed (₦)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-800 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              Add Rule
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <RuleSection
            title="Global Rules"
            rules={globalRules}
            categories={categories}
            onDelete={deleteRule}
          />
          <RuleSection
            title="Category Rules"
            rules={categoryRules}
            categories={categories}
            onDelete={deleteRule}
          />
          <RuleSection
            title="Product-Specific Rules"
            rules={productRules}
            categories={categories}
            onDelete={deleteRule}
          />
        </div>
      </div>
    </div>
  )
}

function RuleSection({
  title,
  rules,
  categories,
  onDelete,
}: {
  title: string
  rules: MarkupRule[]
  categories: Category[]
  onDelete: (id: string) => void
}) {
  if (rules.length === 0) return null

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <h3 className="font-bold px-4 py-3 bg-gray-50">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className="border-t">
              <td className="px-4 py-3">
                {rule.scope === 'global'
                  ? 'All products'
                  : rule.scope === 'category'
                  ? categories.find((c) => c.id === rule.scopeId)?.name ||
                    'Unknown category'
                  : `Product ID: ${rule.scopeId?.slice(0, 8)}...`}
              </td>
              <td className="px-4 py-3">
                {rule.type === 'fixed'
                  ? `₦${rule.value.toLocaleString()}`
                  : `${rule.value}%`}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onDelete(rule.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}