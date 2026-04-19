import Link from 'next/link'
import HeroModelParallax from './HeroModelParallax'
import type { SiteSettings } from '@/types'
import { buildPageHelper } from '@/lib/pageConfig'
import { HERO_DEFAULTS } from '@/lib/pageDefaults'

interface HeroElement {
  id: string; visible: boolean; x: number; y: number
  fontSize?: number; color?: string; content?: string; type?: string
}
interface HeroConfig { elements: HeroElement[]; bgColor: string; accentColor: string }
interface Props { settings: SiteSettings | null }

export default function HeroSection({ settings }: Props) {
  const pageCfg = buildPageHelper(settings, 'hero')

  // Merge page_configs over shared HERO_DEFAULTS — single source of truth
  const merged: HeroConfig = { bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: HERO_DEFAULTS as any[] }
  if (settings?.page_configs) {
    try {
      const pc = JSON.parse(settings.page_configs)
      if (pc?.hero?.elements) {
        merged.elements = HERO_DEFAULTS.map((def: any) => {
          const saved = pc.hero.elements.find((e: any) => e.id === def.id)
          return saved ? { ...def, ...saved } : def
        })
        merged.bgColor = pc.hero.bgColor ?? '#f5f5f3'
        merged.accentColor = pc.hero.accentColor ?? '#f04e0f'
      }
    } catch {}
  }

  const el = (id: string) => merged.elements.find(e => e.id === id)
  const vis = (id: string) => el(id)?.visible !== false

  const description = el('description')?.content
    || settings?.hero_description
    || 'Explore curated collections, exclusive drops and everyday essentials all thoughtfully designed in one stylish shopping destination.'

  const heroImageUrl = el('model_image')?.content?.startsWith('http')
    ? el('model_image')!.content!
    : pageCfg.imageUrl('model_image')

  // Read position/size/zoom from saved model_image element
  const imgEl = el('model_image') as any
  const imgX      = imgEl?.x      ?? 33
  const imgY      = imgEl?.y      ?? 0
  const imgW      = imgEl?.width  ?? 34
  const imgH      = imgEl?.height ?? 100
  const imgZoom   = imgEl?.zoom   ?? 1
  const imgObjPos = imgEl?.objectPosition ?? 'top center'

  // Helper: position element using x/y % — same coordinate system as admin canvas
  const pos = (id: string): React.CSSProperties => {
    const e = el(id)
    if (!e || e.visible === false) return { display: 'none' }
    return {
      position: 'absolute',
      left: `${e.x}%`,
      top: `${e.y}%`,
      zIndex: 10,
    }
  }

  return (
    <>
      {/* Section height — minHeight 100vh so y% positions work across viewport sizes */}
      <section style={{ position: 'relative', minHeight: '100vh', background: merged.bgColor, overflow: 'hidden', paddingTop: 100 }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.05)', pointerEvents: 'none' }} />

        {/* ── Model image (position/size/zoom fully controlled by admin) ── */}
        <HeroModelParallax
          imageUrl={heroImageUrl}
          bgColor={merged.bgColor === '#f5f5f3' ? '#e2e2de' : merged.bgColor}
          x={imgX}
          y={imgY}
          width={imgW}
          height={imgH}
          zoom={imgZoom}
          objectPosition={imgObjPos}
        />

        {/* ── //FASHION tag ── */}
        {vis('tag_left') && (
          <div style={{ ...pos('tag_left'), display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: el('tag_left')?.fontSize ?? 10, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: el('tag_left')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif' }}>
              {el('tag_left')?.content ?? '//FASHION · SS 2026'}
            </span>
            <div style={{ width: 24, height: 1, background: '#ccc' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: merged.accentColor, fontFamily: 'Barlow, sans-serif' }}>SS 2026</span>
          </div>
        )}

        {/* ── Left headline ── */}
        {vis('headline_left') && (
          <div style={{ ...pos('headline_left'), maxWidth: '30%' }}>
            <div style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900,
              fontSize: `clamp(52px, ${(el('headline_left')?.fontSize ?? 108) * 0.09}vw, ${el('headline_left')?.fontSize ?? 108}px)`,
              lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'lowercase',
              color: el('headline_left')?.color ?? '#0d0d0d', whiteSpace: 'pre-line',
            }}>
              {(el('headline_left')?.content ?? 'where\n- style').split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
            </div>
          </div>
        )}

        {/* ── EST. 2026 rule ── */}
        {vis('est_rule') && (
          <div style={{ ...pos('est_rule'), display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 1, background: '#0d0d0d' }} />
            <span style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>EST. 2026</span>
          </div>
        )}

        {/* ── Description ── */}
        {vis('description') && (
          <div style={{ ...pos('description'), maxWidth: '28%' }}>
            <p style={{ fontSize: el('description')?.fontSize ?? 12, lineHeight: 1.8, color: el('description')?.color ?? '#555', fontFamily: 'Barlow, sans-serif', margin: 0 }}>
              {description}
            </p>
          </div>
        )}

        {/* ── Product card ── */}
        {vis('product_card') && (
          <div style={{
            ...pos('product_card'),
            background: '#fff', border: '1px solid #e8e8e5', borderRadius: 14,
            padding: '14px 18px', width: 172,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            fontFamily: 'Barlow, sans-serif',
          }}>
            <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Featured Drop</p>
            <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: el('product_card')?.fontSize ?? 15, lineHeight: 1.2, marginBottom: 10, color: el('product_card')?.color ?? '#0d0d0d' }}>
              {el('product_card')?.content ?? 'Cargo Oversized Jacket'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 22 }}>₹3,499</span>
              <span style={{ fontSize: 9, background: merged.accentColor, color: '#fff', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>-20%</span>
            </div>
          </div>
        )}

        {/* ── New drop + Shop Now ── */}
        {vis('new_drop') && (
          <div style={{ ...pos('new_drop') }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: merged.accentColor }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>New Drop</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', fontFamily: 'Barlow, sans-serif', marginBottom: 10 }}>
              {el('new_drop')?.content ?? 'Collection 2026'}
            </p>
            <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #0d0d0d', borderRadius: 40, padding: '7px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d', fontFamily: 'Barlow, sans-serif' }}>
              Shop Now →
            </Link>
          </div>
        )}

        {/* ── Styled For Life tag ── */}
        {vis('tag_right') && (
          <div style={{ ...pos('tag_right'), display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: el('tag_right')?.fontSize ?? 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: el('tag_right')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif' }}>
              {el('tag_right')?.content ?? 'Styled For Life.'}
            </span>
            <div style={{ width: 24, height: 1, background: '#ccc' }} />
          </div>
        )}

        {/* ── Right headline ── */}
        {vis('headline_right') && (
          <div style={{ ...pos('headline_right'), maxWidth: '32%', textAlign: 'right' }}>
            <div style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900,
              fontSize: `clamp(52px, ${(el('headline_right')?.fontSize ?? 108) * 0.09}vw, ${el('headline_right')?.fontSize ?? 108}px)`,
              lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'lowercase',
              color: el('headline_right')?.color ?? '#0d0d0d', whiteSpace: 'pre-line',
            }}>
              {(el('headline_right')?.content ?? 'lives\n- now').split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
            </div>
          </div>
        )}

        {/* ── Avatar cluster ── */}
        {vis('avatars') && (
          <div style={{ ...pos('avatars'), display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {['J','A'].map((l, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: '#c8c8c6', border: '2px solid ' + merged.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#555', marginLeft: i === 0 ? 0 : -8 }}>{l}</div>
            ))}
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: merged.accentColor, border: '2px solid ' + merged.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', marginLeft: -8 }}>+</div>
          </div>
        )}

        {/* ── Orange star ── */}
        {vis('orange_star') && (
          <div style={{ ...pos('orange_star'), fontSize: el('orange_star')?.fontSize ?? 22, color: el('orange_star')?.color ?? merged.accentColor }} className="animate-spin-slow">✦</div>
        )}

        {/* ── 280K stat ── */}
        {vis('stat') && (
          <div style={{ ...pos('stat'), textAlign: 'right' }}>
            <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: el('stat')?.fontSize ?? 64, lineHeight: 1, margin: 0, color: el('stat')?.color ?? '#0d0d0d' }}>
              {el('stat')?.content ?? '280K'}
            </p>
          </div>
        )}

        {/* ── Stat label ── */}
        {vis('stat_label') && (
          <div style={{ ...pos('stat_label'), textAlign: 'right' }}>
            <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: el('stat_label')?.color ?? '#aaa', fontFamily: 'Barlow, sans-serif', margin: 0 }}>
              {el('stat_label')?.content ?? 'PEOPLE WE INSPIRE'}
            </p>
          </div>
        )}

        {/* ── Scroll indicator ── */}
        {vis('scroll_ind') && (
          <div style={{ ...pos('scroll_ind'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.3 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, #0d0d0d)' }} />
            <span style={{ fontSize: 8, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, writingMode: 'vertical-rl', fontFamily: 'Barlow, sans-serif' }}>Scroll</span>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#e0e0dd' }} />
      </section>
    </>
  )
}
