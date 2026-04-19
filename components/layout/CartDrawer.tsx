'use client'

import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

interface Props { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart()

  const goCheckout = () => { onClose(); router.push('/checkout') }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          backdropFilter: open ? 'blur(2px)' : 'none',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 71,
        width: 420, background: '#fff',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Barlow, sans-serif',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={18} />
            <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '2px', textTransform: 'uppercase' }}>Cart</span>
            {totalItems > 0 && (
              <span style={{ background: '#f04e0f', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{totalItems}</span>
            )}
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e8e8e5', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 80, color: '#aaa' }}>
              <ShoppingBag size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 14, marginBottom: 20 }}>Your cart is empty</p>
              <Link href="/shop" onClick={onClose} style={{ padding: '10px 24px', border: '1.5px solid #0d0d0d', borderRadius: 40, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d' }}>Shop Now</Link>
            </div>
          ) : (
            items.map((item, i) => {
              const price = item.color.price ?? item.product.price
              return (
                <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid #f0f0ee' }}>
                  {/* Image */}
                  <div style={{ width: 72, height: 84, borderRadius: 10, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} width={72} height={84} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px', lineHeight: 1.3 }}>{item.product.name}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: '0 0 10px' }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: item.color.hex, border: '1px solid #e8e8e5', marginRight: 5, verticalAlign: 'middle' }} />
                      {item.color.name} · Size {item.size}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e8e8e5', borderRadius: 20, overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity - 1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity + 1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={11} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 16 }}>
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button onClick={() => removeItem(item.product.id, item.size, item.color.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #e8e8e5', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 15 }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 16, textAlign: 'center' }}>
              Delivery charges calculated at checkout
            </p>
            <button
              onClick={goCheckout}
              style={{ width: '100%', padding: '15px', borderRadius: 40, border: 'none', background: '#0d0d0d', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', transition: 'background 0.2s' }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
