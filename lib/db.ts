import { supabase } from './supabase'
import type { Product, Category, Order, SiteSettings } from '@/types'

// ─── PRODUCTS ───────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string
  featured?: boolean
  active?: boolean
  limit?: number
}) {
  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .order('created_at', { ascending: false })

  if (options?.active !== false) query = query.eq('is_active', true)
  if (options?.featured) query = query.eq('is_featured', true)
  if (options?.category) query = query.eq('categories.slug', options.category)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) throw error
  return data as Product
}

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit })
}

// ─── CATEGORIES ─────────────────────────────────────────────
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

// ─── ORDERS ─────────────────────────────────────────────────
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ─── SITE SETTINGS ──────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single()
  if (error) throw error
  return data as SiteSettings
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const { error } = await supabase
    .from('site_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', settings.id)
  if (error) throw error
}

// ─── STORAGE ────────────────────────────────────────────────
export function getImageUrl(path: string) {
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProductImage(file: File, productId: string) {
  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return getImageUrl(path)
}

export async function deleteProductImage(path: string) {
  // Extract path from full URL
  const parts = path.split('/product-images/')
  if (parts.length < 2) return
  const { error } = await supabase.storage
    .from('product-images')
    .remove([parts[1]])
  if (error) throw error
}
