'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'

interface ShippingSetting {
  type: 'fixed' | 'percent'
  value: number
}

export default function ShippingPage() {
  const [setting, setSetting] = useState<ShippingSetting | null>(null)
  const [type, setType] = useState<'fixed' | 'percent'>('fixed')
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const res = await fetch('/api/admin/shipping')
    const data = await res.json()
    setSetting(data)
    setType(data.type)
    setValue(String(data.value))
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setBusy(true)
    setMsg('')
    const res = await fetch('/api/admin/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value: parseFloat(value) }),
    })
    const data = await res.json()
    if (res.ok) {
      setSetting(data)
            setMsg(
        `Saved. Recalculated ${data.recalculated?.productsUpdated ?? 0} product(s) and ${
          data.recalculated?.variantsUpdated ?? 0
        } variant(s) immediately.`
      )
    } else {
      setMsg(data.error || 'Something went wrong')
    }
    setBusy(false)
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Shipping Buffer</h1>

        <p className="text-sm text-gray-600 mb-6">
          AliExpress doesn't give us real per-order shipping cost through the API we have
          access to, so this is a manual estimate added to each item's price before your
          markup is applied — protecting your margin from shipping costs eating into it.
        </p>

        {setting && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-500">Current setting</div>
            <div className="text-xl font-bold">
              {setting.type === 'fixed'
                ? `₦${setting.value.toLocaleString()} flat, per item`
                : `${setting.value}% of item price`}
            </div>
          </div>
        )}

        {msg && <div className="mb-4 text-sm text-blue-800">{msg}</div>}

        <div className="bg-white border rounded-lg p-6">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={type === 'fixed'}
                onChange={() => setType('fixed')}
              />
              Flat amount (₦)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={type === 'percent'}
                onChange={() => setType('percent')}
              />
              Percentage (%)
            </label>
          </div>

          <div className="flex gap-3 items-end">
            <input
              type="number"
              step={type === 'fixed' ? '100' : '0.5'}
              min="0"
              placeholder={type === 'fixed' ? 'e.g. 2000' : 'e.g. 8'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-3 py-2 w-40"
            />
            <button
              disabled={busy || !value}
              onClick={save}
              className="bg-blue-800 text-white px-5 py-2 rounded disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}