'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/import', label: 'Import' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/markup', label: 'Markup Rules' },
    { href: '/admin/orders', label: 'Orders' },
  ]

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="bg-gray-900 text-white p-4 mb-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <span className="font-bold">Easy Fix Admin</span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'underline' : 'hover:text-gray-300'}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-300 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}