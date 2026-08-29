import Link from 'next/link'
import { getProducts, getCategories, formatNaira } from '@/lib/products'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const { products, totalCount, pageSize } = await getProducts({ page })
  const categories = await getCategories()
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#22304A] to-[#1A2740]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(74,114,184,0.35), transparent 60%)',
          }}
        />
        <div className="relative max-w-[100rem] mx-auto px-6 py-28 flex flex-col items-center text-center">
          <span className="text-[#8FB0E0] text-xs font-semibold tracking-widest uppercase mb-4">
            Genuine replacement parts
          </span>
          <h1 className="font-[family-name:var(--font-display)] font-extrabold text-white text-6xl sm:text-7xl tracking-tight">
            Screens
          </h1>
          <p className="text-white/70 mt-4 max-w-md">
            Find the exact replacement screen for your phone — real parts, fair prices, delivered.
          </p>
          <form action="/search" className="mt-8 max-w-md w-full flex shadow-lg shadow-black/20 rounded-full overflow-hidden">
            <input
              type="text"
              name="q"
              placeholder="Search on Easy Fix Screens"
              className="flex-1 px-5 py-3 text-[#22304A] text-sm bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#4A72B8] text-white text-sm font-semibold px-6 hover:bg-[#3d5f9d] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-[100rem] mx-auto px-6 py-14 flex flex-col md:flex-row gap-6 md:gap-10 w-full flex-1">
        {/* Category pills — mobile only */}
        <div className="md:hidden -mx-6 px-6 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/"
            className="shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap bg-[#22304A] text-white font-medium"
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap bg-[#F4F5F7] text-[#5B6472]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        
        {/* Category sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <h2 className="text-xs font-semibold text-[#8B93A1] uppercase tracking-wide mb-3">
            Category
          </h2>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/"
                className="block px-3 py-2 rounded-lg transition-colors bg-[#22304A] text-white font-medium"
              >
                All Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="block px-3 py-2 rounded-lg transition-colors text-[#5B6472] hover:bg-[#F4F5F7]"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-center text-[#5B6472] py-20">
              No products yet — import some from the admin page.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-white shadow-sm shadow-black/5 border border-[#EEF0F3] p-3 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
                >
                  <Link href={`/product/${product.id}`} className="block relative">
                    {product.category && (
                      <span className="absolute top-2 right-2 bg-white/95 text-[10px] px-2 py-0.5 rounded-full border border-[#E5E7EB] text-[#5B6472] z-10">
                        {product.category.name}
                      </span>
                    )}
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#F4F5F7]">
                      {product.images[0] && (
                        <img
                          src={product.images[0].thumbnailUrl || product.images[0].storageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Link>
                  <p className="mt-3 text-sm font-medium line-clamp-2 text-[#22304A]">
                    {product.title}
                  </p>
                  <p className="mt-1 text-base font-bold text-[#22304A]">
                    {formatNaira(product.finalPrice)}
                  </p>
                  <Link
                    href={`/product/${product.id}`}
                    className="mt-3 text-center text-sm bg-[#22304A] text-white py-2 rounded-full font-medium hover:bg-[#3d5f9d] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                    p === page
                      ? 'bg-[#22304A] text-white'
                      : 'text-[#5B6472] hover:bg-[#F4F5F7]'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#22304A] text-white/70 mt-10">
        <div className="max-w-[100rem] mx-auto px-6 py-14 flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="bg-white rounded-md p-1.5 inline-block mb-3">
              <img src="/logo.png" alt="Easy Fix Screens" className="h-8" />
            </div>
            <p className="text-sm max-w-xs">Real replacement screens, fair prices, shipped to you.</p>
          </div>
          <div className="text-sm">
            <p className="text-white font-medium mb-2">Support</p>
            <p>Contact Us</p>
            <p>Shipping</p>
          </div>
        </div>
        <div className="border-t border-white/10 text-center text-xs py-4">
          © {new Date().getFullYear()} Easy Fix Screens. All Rights Reserved.
        </div>
      </footer>
    </>
  )
}