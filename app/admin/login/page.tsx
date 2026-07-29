'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin/import')
      router.refresh()
    } else {
      setError('Incorrect username or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-[#EEF0F3] p-8 w-full max-w-sm"
      >
        <h1 className="font-[family-name:var(--font-display)] font-bold text-xl text-[#22304A] mb-6">
          Admin Login
        </h1>

        <label className="block text-sm text-[#5B6472] mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-[#EEF0F3] rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:border-[#22304A]"
          required
        />

        <label className="block text-sm text-[#5B6472] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#EEF0F3] rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:border-[#22304A]"
          required
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#22304A] text-white py-2.5 rounded-full font-semibold hover:bg-[#3d5f9d] transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}