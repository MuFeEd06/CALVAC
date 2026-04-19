'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import CartDrawer from './CartDrawer'
import type { SiteSettings } from '@/types'

interface Props { settings?: SiteSettings | null }
interface CatItem { id: string; name: string; visible: boolean; imageUrl: string; count: number; fontSize: number; color: string }

const DEFAULT_LINKS = [
  { href: '/shop',                      label: 'Shop' },
  { href: '/shop?category=jackets',     label: 'Jackets' },
  { href: '/shop?category=tees',        label: 'Tees' },
  { href: '/shop?category=pants',       label: 'Pants' },
  { href: '/shop?category=accessories', label: 'Accessories' },
]

export default function Navbar({ settings }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  const announcement = settings?.announcement_text ?? ''
  const ANNOUNCE_H = announcement ? 36 : 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = (() => {
    try {
      const pc = settings?.page_configs ? JSON.parse(settings.page_configs) : null
      const items: CatItem[] = pc?._categoryItems
      if (Array.isArray(items) && items.length > 0) {
        const cats = items.filter(c => c.visible !== false).map(c => ({
          href: `/shop?category=${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`,
          label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        }))
        return [{ href: '/shop', label: 'Shop' }, ...cats]
      }
    } catch {}
    return DEFAULT_LINKS
  })()

  const btn: React.CSSProperties = {
    width: 40, height: 40, border: '1.5px solid #0d0d0d', borderRadius: '50%',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.2s', position: 'relative', flexShrink: 0,
    fontFamily: 'var(--font-barlow), Barlow, sans-serif',
  }

  return (
    <>
      {/* Announcement bar — fixed at absolute top */}
      {announcement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          height: ANNOUNCE_H, background: '#0d0d0d', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, letterSpacing: '3px', fontWeight: 600,
          textTransform: 'uppercase', fontFamily: 'Barlow, sans-serif',
        }}>{announcement}</div>
      )}

      {/* Navbar — fixed directly below announcement bar (or at top: 0 if none) */}
      <nav style={{
        position: 'fixed',
        top: ANNOUNCE_H,
        left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: scrolled ? 'rgba(245,245,243,0.95)' : '#f5f5f3',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
        fontFamily: 'var(--font-barlow), Barlow, sans-serif',
      }}>
        <button onClick={() => setMenuOpen(true)} style={btn} aria-label="Menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#0d0d0d' }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#0d0d0d' }} />
          </div>
        </button>

        <Link href="/" style={{
          fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
          fontWeight: 700, fontSize: 22, letterSpacing: '6px',
          textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d',
        }}>CALVAC</Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={btn} aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button onClick={() => setCartOpen(true)} style={btn} aria-label="Cart">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: '#f04e0f', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
          <Link href="/account" style={{ textDecoration: 'none' }}>
            <button style={btn} aria-label="Account">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </Link>
        </div>
      </nav>

      {/* Backdrop */}
      <div onClick={() => setMenuOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 58,
        background: 'rgba(0,0,0,0.45)',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} />

      {/* Side drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 59,
        width: 320, background: '#0d0d0d',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        boxShadow: menuOpen ? '8px 0 40px rgba(0,0,0,0.4)' : 'none',
        fontFamily: 'var(--font-barlow), Barlow, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 28px 20px' }}>
          <span style={{ fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '6px', color: '#fff', textTransform: 'uppercase' }}>CALVAC</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close" style={{ width: 36, height: 36, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '50%', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 28px' }} />
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navLinks.map((link, i) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 28px',
              fontFamily: i === 0 ? 'var(--font-barlow), Barlow, sans-serif' : 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
              fontWeight: i === 0 ? 500 : 700,
              fontSize: i === 0 ? 13 : 28,
              letterSpacing: i === 0 ? '3px' : '-0.5px',
              textTransform: i === 0 ? 'uppercase' : 'lowercase',
              textDecoration: 'none',
              color: i === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              transition: 'color 0.2s',
            }}>{link.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '20px 28px 32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>© 2026 CALVAC</p>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
