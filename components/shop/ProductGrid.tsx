import ProductCard from './ProductCard'
import type { Product } from '@/types'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-condensed font-700 text-2xl text-[var(--gray-mid)]">No products found</p>
        <p className="text-sm text-[var(--gray-mid)] mt-2">Try adjusting your filters</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
