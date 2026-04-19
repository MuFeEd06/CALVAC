'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  return (
    <Link href={`/product/${product.slug}`} className={`group block ${className}`}>
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--gray-light)] aspect-[3/4]">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover img-zoom"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--gray-mid)] text-xs tracking-widest uppercase">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-[var(--orange)] text-white text-[10px] font-700 px-2 py-0.5 tracking-wider">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-black text-white text-[10px] font-700 px-2 py-0.5 tracking-wider">
              FEATURED
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="text-white text-xs font-600 tracking-widest uppercase border border-white px-6 py-2">
            View Product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <p className="text-[11px] text-[var(--gray-mid)] tracking-widest uppercase mb-1">
          {product.category?.name}
        </p>
        <h3 className="font-500 text-sm leading-snug">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="font-condensed font-700 text-lg">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.compare_price && (
            <span className="text-xs text-[var(--gray-mid)] line-through">
              ₹{product.compare_price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.colors.slice(0, 5).map(color => (
              <div
                key={color.name}
                title={color.name}
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-[var(--gray-mid)] self-center">+{product.colors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
