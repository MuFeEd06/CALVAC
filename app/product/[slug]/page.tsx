import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductDetailClient from './ProductDetailClient'
import { getProductBySlug, getSiteSettings } from '@/lib/db'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug).catch(() => null)
  if (!product) return { title: 'Product — CALVAC' }
  return {
    title: `${product.name} — CALVAC`,
    description: product.description ?? undefined,
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  if (!product) notFound()

  return (
    <>
      <Navbar settings={settings} />
      <ProductDetailClient product={product} />
      <Footer settings={settings} />
    </>
  )
}
