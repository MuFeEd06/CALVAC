import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/shop/ProductGrid'
import ShopFilters from '@/components/shop/ShopFilters'
import { getProducts, getCategories, getSiteSettings } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop — CALVAC',
  description: 'Browse all CALVAC collections',
}

interface ShopPageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    min?: string
    max?: string
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, categories, settings] = await Promise.all([
    getProducts({ active: true }),
    getCategories(),
    getSiteSettings().catch(() => null),
  ])

  // Filter client-side (could move to DB query for large catalogs)
  let filtered = products
  if (searchParams.category) {
    filtered = filtered.filter(p => p.category?.slug === searchParams.category)
  }
  if (searchParams.search) {
    const q = searchParams.search.toLowerCase()
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }
  if (searchParams.min) {
    filtered = filtered.filter(p => p.price >= Number(searchParams.min))
  }
  if (searchParams.max) {
    filtered = filtered.filter(p => p.price <= Number(searchParams.max))
  }
  if (searchParams.sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (searchParams.sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price)
  } else if (searchParams.sort === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return (
    <>
      <Navbar settings={settings} />
      <main className="pt-24 min-h-screen bg-[var(--white)]">
        {/* Header */}
        <div className="px-6 md:px-12 py-10 border-b border-[var(--gray-light)]">
          <h1 className="font-condensed font-900 text-5xl md:text-7xl tracking-tight">
            {searchParams.category
              ? categories.find(c => c.slug === searchParams.category)?.name ?? 'Collection'
              : 'ALL PRODUCTS'}
          </h1>
          <p className="text-[var(--gray-mid)] text-sm mt-2">{filtered.length} items</p>
        </div>

        <div className="flex">
          {/* Sidebar filters */}
          <ShopFilters categories={categories} searchParams={searchParams} settings={settings} />

          {/* Product grid */}
          <div className="flex-1 px-6 md:px-10 py-8">
            <ProductGrid products={filtered} />
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  )
}
