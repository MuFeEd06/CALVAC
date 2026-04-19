'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Eye, EyeOff, Move, RotateCcw, Layers, Image as ImageIcon, Monitor, Settings, Bell } from 'lucide-react'
import { HERO_DEFAULTS, FEATURED_DEFAULTS, CATEGORIES_DEFAULTS, CAROUSEL_DEFAULTS, COLLECTIONS_DEFAULTS, FOOTER_DEFAULTS } from '@/lib/pageDefaults'

// ─── Types ────────────────────────────────────────────────────
type PageId = 'hero' | 'featured_moments' | 'categories' | 'carousel' | 'collections' | 'footer'
type Tab = 'pages' | 'store' | 'announcement'

interface PageElement {
  id: string
  label: string
  visible: boolean
  x: number        // % from left of canvas
  y: number        // % from top of canvas
  fontSize?: number
  color?: string
  content?: string
  imageUrl?: string
  width?: number   // % of canvas width
  height?: number  // % of canvas height
  isImage?: boolean
  type?: 'product_card' | 'avatars' | 'default'
  zoom?: number           // image zoom scale, 1.0 = 100%
  objectPosition?: string // CSS object-position e.g. 'top center'
}

interface PageConfig {
  id: PageId
  label: string
  icon: string
  bgColor: string
  accentColor: string
  elements: PageElement[]
}


// ─── Page configs using shared defaults ───────────────────────
const DEFAULTS: Record<PageId, PageConfig> = {
  hero:             { id: 'hero',             label: 'Hero Section',       icon: '①', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: HERO_DEFAULTS as any },
  featured_moments: { id: 'featured_moments', label: 'Featured Moments',   icon: '②', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: FEATURED_DEFAULTS as any },
  categories:       { id: 'categories',       label: 'Categories',         icon: '③', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: CATEGORIES_DEFAULTS as any },
  carousel:         { id: 'carousel',         label: 'Collection Carousel',icon: '④', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: CAROUSEL_DEFAULTS as any },
  collections:      { id: 'collections',      label: 'Collections',        icon: '⑤', bgColor: '#f5f5f3', accentColor: '#f04e0f', elements: COLLECTIONS_DEFAULTS as any },
  footer:           { id: 'footer',           label: 'Footer',             icon: '⑥', bgColor: '#0d0d0d', accentColor: '#f04e0f', elements: FOOTER_DEFAULTS as any },
}



// ─── Helpers ──────────────────────────────────────────────────
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 8, fontFamily: 'Barlow, sans-serif' }}>{label}</label>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, hint, multiline }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string; multiline?: boolean
}) {
  const s: React.CSSProperties = {
    width: '100%', border: '1px solid #e8e8e5', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, fontFamily: 'Barlow, sans-serif',
    outline: 'none', boxSizing: 'border-box', resize: 'none' as const, background: 'transparent'
  }
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 8, fontFamily: 'Barlow, sans-serif' }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} style={s} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />}
      {hint && <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

// ─── Page-specific background decorations ────────────────────
function PageBackground({ config }: { config: PageConfig }) {
  if (config.id === 'featured_moments') {
    return (
      <>
        {/* S watermark behind col 2 */}
        <div style={{
          position: 'absolute', left: '14%', top: '-12%',
          fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900,
          fontSize: 500, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)',
          pointerEvents: 'none', userSelect: 'none', zIndex: 0,
        }}>S</div>

        {/* Col dividers at 28% and 66% — matching actual gridTemplateColumns 28fr 38fr 34fr */}
        <div style={{ position: 'absolute', left: '28%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Column labels */}
        <div style={{ position: 'absolute', top: 5, left: '1%',  fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow, sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 1 · 28%</div>
        <div style={{ position: 'absolute', top: 5, left: '30%', fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow, sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 2 · 38% (S-shape image)</div>
        <div style={{ position: 'absolute', top: 5, left: '67%', fontSize: 8, color: 'rgba(0,0,0,0.25)', fontFamily: 'Barlow, sans-serif', pointerEvents: 'none', zIndex: 2 }}>Col 3 · 34%</div>

        {/* S-shape vessel tint showing the clip area */}
        <div style={{
          position: 'absolute', left: '29%', top: '2%', width: '36%', height: '75%',
          background: 'rgba(200,185,150,0.15)',
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 20%, 75% 20%, 100% 45%, 100% 80%, 70% 100%, 20% 100%, 0% 80%, 30% 65%, 0% 45%, 0% 20%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* White stripe at 69% of image height */}
        <div style={{
          position: 'absolute',
          left: '29%', width: '35%',
          top: `calc(2% + 75% * 0.69)`,
          height: 4, background: 'rgba(255,255,255,0.8)',
          pointerEvents: 'none', zIndex: 3,
        }} />
        <div style={{
          position: 'absolute',
          left: '29%',
          top: `calc(2% + 75% * 0.69 + 5px)`,
          fontSize: 7, color: 'rgba(0,0,0,0.3)', fontFamily: 'Barlow, sans-serif',
          pointerEvents: 'none', zIndex: 3,
        }}>white stripe (69%)</div>

        {/* Divider line in col 3 between price1 and product2 */}
        <div style={{
          position: 'absolute', left: '67%', right: '1%',
          top: '34%', height: 1, background: 'rgba(0,0,0,0.08)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      </>
    )
  }
  if (config.id === 'hero') {
    return (
      <>
        <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '67%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        {[{l:'Left Col',x:'2%'},{l:'Model Image',x:'35%'},{l:'Right Col',x:'69%'}].map((c,i) => (
          <div key={i} style={{ position: 'absolute', top: 4, left: c.x, fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow, sans-serif', pointerEvents: 'none' }}>{c.l}</div>
        ))}
      </>
    )
  }
  if (config.id === 'categories') {
    // Read category items saved in config (passed via a special _items field)
    const catItems: any[] = (config as any)._items ?? [
      { name: 'accessories', count: 174, color: '#0d0d0d', visible: true },
      { name: 'hoodies',     count: 361, color: '#999999', visible: true },
      { name: 'jackets',     count: 368, color: '#bbbbbb', visible: true },
      { name: 'pants',       count: 117, color: '#cccccc', visible: true },
      { name: 'tees',        count: 78,  color: '#dddddd', visible: true },
    ]
    const visibleItems = catItems.filter(c => c.visible !== false)
    const yPositions = ['17%','30%','42%','52%','61%','70%','78%']
    const fontSizes = [11,9,8,7,6.5,6,5.5]

    return (
      <>
        {/* C watermark */}
        <div style={{ position: 'absolute', right: '-4%', top: '-5%', fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: 320, lineHeight: 0.85, color: 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>C</div>

        {/* Column divider */}
        <div style={{ position: 'absolute', left: '44%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 4, left: '1%',  fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>Image</div>
        <div style={{ position: 'absolute', top: 4, left: '46%', fontSize: 8, color: 'rgba(0,0,0,0.2)', fontFamily: 'Barlow,sans-serif', pointerEvents: 'none' }}>Category List</div>

        {/* Arrow geometric cutout tint */}
        <div style={{ position: 'absolute', left: '0%', top: '5%', width: '41%', height: '88%', background: 'rgba(200,196,190,0.25)', clipPath: 'polygon(0% 0%, 72% 0%, 72% 25%, 100% 50%, 72% 75%, 72% 100%, 0% 100%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Dynamic category rows from actual data */}
        {visibleItems.map((cat, i) => (
          <div key={i} style={{ position: 'absolute', left: '45%', right: '1%', top: yPositions[i] ?? `${17 + i * 10}%`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 3, pointerEvents: 'none', zIndex: 2 }}>
            <span style={{ fontSize: 7, color: i === 0 ? '#333' : '#ccc', fontFamily: 'Barlow,sans-serif' }}>[{String(i+1).padStart(2,'0')}]</span>
            <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 900, fontSize: (fontSizes[i] ?? 5) * 1.8, color: i === 0 ? (cat.color ?? '#0d0d0d') : cat.color ?? '#ccc', textTransform: 'lowercase', flex: 1, textAlign: 'right', paddingRight: 8 }}>{cat.name}</span>
            <span style={{ fontSize: 7, color: '#ccc', fontFamily: 'Barlow,sans-serif', width: 28, textAlign: 'right' }}>({cat.count})</span>
          </div>
        ))}

        {/* Scroll widget */}
        <div style={{ position: 'absolute', left: '55%', top: '82%', display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none', zIndex: 2 }}>
          <span style={{ fontSize: 7, color: '#aaa', fontFamily: 'Barlow,sans-serif', letterSpacing: '1px' }}>[CATEGORIES]</span>
          <div style={{ width: 40, borderTop: '1px dashed #ccc' }} />
          <div style={{ width: 12, height: 18, border: '1px solid #ccc', borderRadius: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 2 }}>
            <div style={{ width: 2, height: 4, background: '#888', borderRadius: 1 }} />
          </div>
        </div>
      </>
    )
  }
  if (config.id === 'collections') {
    return (
      <>
        <div style={{ position: 'absolute', left: '44%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        {/* S-shape tint on left image area */}
        <div style={{
          position: 'absolute', left: '1%', top: '12%', width: '38%', height: '55%',
          background: 'rgba(0,0,0,0.05)',
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 20%, 75% 20%, 100% 45%, 100% 80%, 70% 100%, 20% 100%, 0% 80%, 30% 65%, 0% 45%, 0% 20%)',
          pointerEvents: 'none',
        }} />
      </>
    )
  }
  if (config.id === 'carousel') {
    return (
      // Show card layout guide
      <div style={{ position: 'absolute', left: '2%', top: '22%', right: '2%', height: '72%', background: 'rgba(0,0,0,0.02)', borderRadius: 4, pointerEvents: 'none', border: '1px dashed rgba(0,0,0,0.06)' }} />
    )
  }
  return null
}

// ─── Canvas Preview Component ─────────────────────────────────
function PageCanvas({ config, selectedId, onSelect, onDrag }: {
  config: PageConfig
  selectedId: string | null
  onSelect: (id: string) => void
  onDrag: (id: string, x: number, y: number) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string | null>(null)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })
  const [canvasW, setCanvasW] = useState(640)

  useEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver(entries => {
      setCanvasW(entries[0].contentRect.width)
    })
    ro.observe(canvasRef.current)
    setCanvasW(canvasRef.current.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation()
    onSelect(id)
    dragging.current = id
    const el = config.elements.find(x => x.id === id)!
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, elX: el.x, elY: el.y }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dxPct = ((e.clientX - dragStart.current.mouseX) / rect.width) * 100
    const dyPct = ((e.clientY - dragStart.current.mouseY) / rect.height) * 100
    const newX = Math.max(0, Math.min(90, dragStart.current.elX + dxPct))
    const newY = Math.max(0, Math.min(90, dragStart.current.elY + dyPct))
    onDrag(dragging.current, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10)
  }

  const onMouseUp = () => { dragging.current = null }

  const isFooter = config.id === 'footer'
  const CANVAS_H = 760

  return (
    <div
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        position: 'relative', width: '100%', height: CANVAS_H, minHeight: CANVAS_H,
        background: config.bgColor, borderRadius: 8, overflow: 'hidden',
        cursor: 'default', userSelect: 'none',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}
    >
      {/* Page-specific background decorations */}
      <PageBackground config={config} />

      {/* Generic grid lines for non-specialized pages */}
      {!['featured_moments','hero','categories','collections','carousel'].includes(config.id) && [25, 50, 75].map(p => (
        <div key={p} style={{
          position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
          width: 1, background: isFooter ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      {/* Page label badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 50,
        background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 6,
        padding: '3px 10px', fontSize: 10, letterSpacing: '1px',
        fontFamily: 'Barlow, sans-serif', pointerEvents: 'none',
      }}>{config.label}</div>

      {/* Elements */}
      {config.elements.filter(e => e.visible).map(e => {
        const isSelected = selectedId === e.id
        const isImg = e.isImage

        return (
          <div
            key={e.id}
            onMouseDown={ev => onMouseDown(ev, e.id)}
            title={e.label}
            style={{
              position: 'absolute',
              left: `${e.x}%`,
              top: `${e.y}%`,
              cursor: 'grab',
              zIndex: isSelected ? 30 : 10,
              outline: isSelected
                ? `2px dashed ${config.accentColor}`
                : '2px dashed transparent',
              outlineOffset: 2,
              borderRadius: 3,
              transition: 'outline 0.15s',
            }}
          >
            {isImg ? (
              <div style={{
                width: `${((e.width ?? 20) / 100) * canvasW}px`,
                height: `${(e.height ?? 30) * (CANVAS_H / 100)}px`,
                background: e.imageUrl
                  ? `url(${e.imageUrl}) center/cover no-repeat`
                  : (e.color ?? '#ddd'),
                borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                minWidth: 40, minHeight: 40,
              }}>
                {!e.imageUrl && (
                  <div style={{ textAlign: 'center', padding: 4 }}>
                    <ImageIcon size={14} color="rgba(255,255,255,0.4)" />
                    <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', fontFamily: 'Barlow, sans-serif', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1.3 }}>
                      {e.label}
                    </p>
                  </div>
                )}
              </div>
            ) : e.type === 'product_card' ? (
              /* Product card widget */
              <div style={{
                background: '#fff', border: '1px solid #e8e8e5', borderRadius: 10,
                padding: '8px 12px', width: 120,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                fontFamily: 'Barlow, sans-serif',
              }}>
                <p style={{ fontSize: 7, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', margin: '0 0 4px' }}>Featured Drop</p>
                <p style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: e.fontSize ?? 13, lineHeight: 1.2, margin: '0 0 6px', color: e.color ?? '#0d0d0d' }}>
                  {e.content ?? 'Cargo Oversized Jacket'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 16 }}>₹3,499</span>
                  <span style={{ fontSize: 8, background: config.accentColor, color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>-20%</span>
                </div>
              </div>
            ) : e.type === 'avatars' ? (
              /* Avatar cluster */
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {['J','A'].map((l, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#c8c8c6', border: `2px solid ${config.bgColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, color: '#555',
                    marginLeft: i === 0 ? 0 : -6, fontFamily: 'Barlow, sans-serif',
                  }}>{l}</div>
                ))}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: config.accentColor, border: `2px solid ${config.bgColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff', marginLeft: -6,
                }}>+</div>
              </div>
            ) : (
              <div style={{
                fontFamily: (
                  e.id.includes('headline') || e.id.includes('stat') ||
                  e.id.includes('price') || e.id.includes('feat_title') ||
                  e.id.includes('cat') || e.id.includes('col')
                ) ? '"Barlow Condensed", sans-serif' : 'Barlow, sans-serif',
                fontWeight: e.id.includes('headline') || e.id.includes('stat') || e.id.includes('price') || e.id.includes('cat') ? 900 : 500,
                // Scale font size: canvas is ~canvasW px, live page reference is 1366px
                fontSize: Math.max(7, Math.round((e.fontSize ?? 12) * (canvasW / 1366))),
                color: e.color ?? '#0d0d0d',
                whiteSpace: 'pre-line',
                lineHeight: 1.1,
                // Clamp width so elements don't overflow their column
                maxWidth: `${Math.max(60, 32 - e.x / 3)}%`,
                overflow: 'hidden',
              }}>
                {e.content || e.label}
              </div>
            )}

            {/* Selection handle */}
            {isSelected && (
              <div style={{
                position: 'absolute', top: -18, left: 0,
                background: config.accentColor, color: '#fff',
                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                whiteSpace: 'nowrap', fontFamily: 'Barlow, sans-serif',
                pointerEvents: 'none', zIndex: 40,
              }}>{e.label}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Category item type ───────────────────────────────────────
interface CategoryItem {
  id: string
  name: string
  visible: boolean
  imageUrl: string
  count: number
  fontSize: number
  color: string
}

const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'cat_0', name: 'accessories', visible: true, imageUrl: '', count: 174, fontSize: 96, color: '#0d0d0d' },
  { id: 'cat_1', name: 'hoodies',     visible: true, imageUrl: '', count: 361, fontSize: 64, color: '#999999' },
  { id: 'cat_2', name: 'jackets',     visible: true, imageUrl: '', count: 368, fontSize: 46, color: '#bbbbbb' },
  { id: 'cat_3', name: 'pants',       visible: true, imageUrl: '', count: 117, fontSize: 36, color: '#cccccc' },
  { id: 'cat_4', name: 'tees',        visible: true, imageUrl: '', count: 78,  fontSize: 28, color: '#dddddd' },
]

// ─── Main Page ────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('pages')
  const [activePage, setActivePage] = useState<PageId>('hero')
  const [configs, setConfigs] = useState<Record<PageId, PageConfig>>({ ...DEFAULTS })
  const [selectedEl, setSelectedEl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingCatImg, setUploadingCatImg] = useState<string | null>(null)
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)

  // Category items — separate from generic page elements
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(DEFAULT_CATEGORY_ITEMS)

  const [brandName, setBrandName] = useState('CALVAC')
  const [whatsapp, setWhatsapp] = useState('')
  const [announcement, setAnnouncement] = useState('Free Shipping on Orders Above ₹2000 · New Drop Every Friday')
  const [instagram, setInstagram] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => {
      if (!data) return
      setBrandName(data.brand_name ?? 'CALVAC')
      setWhatsapp(data.whatsapp_number ?? '')
      setAnnouncement(data.announcement_text ?? '')
      setInstagram(data.instagram_url ?? '')
      if (data.page_configs) {
        try {
          const pc = JSON.parse(data.page_configs)
          setConfigs(prev => ({ ...prev, ...pc }))
          if (pc?._categoryItems) setCategoryItems(pc._categoryItems)
        } catch {}
      }
    })
  }, [])

  const cfg = configs[activePage]
  const selEl = cfg.elements.find(e => e.id === selectedEl)

  const updateEl = (id: string, patch: Partial<PageElement>) =>
    setConfigs(c => ({ ...c, [activePage]: { ...c[activePage], elements: c[activePage].elements.map(e => e.id === id ? { ...e, ...patch } : e) } }))

  const handleDrag = (id: string, x: number, y: number) => updateEl(id, { x, y })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, elId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const path = `page-editor/${activePage}/${elId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      updateEl(elId, { imageUrl: data.publicUrl })
    } catch { alert('Upload failed. Check Supabase storage.') }
    finally { setUploadingImg(false) }
  }

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCatImg(catId)
    try {
      const path = `page-editor/categories/${catId}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setCategoryItems(items => items.map(c => c.id === catId ? { ...c, imageUrl: data.publicUrl } : c))
    } catch { alert('Upload failed.') }
    finally { setUploadingCatImg(null) }
  }

  const updateCatItem = (id: string, patch: Partial<CategoryItem>) =>
    setCategoryItems(items => items.map(c => c.id === id ? { ...c, ...patch } : c))

  const addCatItem = () => {
    const newId = `cat_${Date.now()}`
    setCategoryItems(items => [...items, {
      id: newId, name: 'new category', visible: true,
      imageUrl: '', count: 0, fontSize: 22, color: '#cccccc'
    }])
    setSelectedCatId(newId)
  }

  const removeCatItem = (id: string) => {
    setCategoryItems(items => items.filter(c => c.id !== id))
    if (selectedCatId === id) setSelectedCatId(null)
  }

  const moveCatItem = (id: string, dir: -1 | 1) => {
    setCategoryItems(items => {
      const idx = items.findIndex(c => c.id === id)
      if (idx < 0) return items
      const next = idx + dir
      if (next < 0 || next >= items.length) return items
      const arr = [...items]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: row } = await supabase.from('site_settings').select('id').single()
      if (!row?.id) throw new Error('No settings row found')
      await supabase.from('site_settings').update({
        brand_name: brandName,
        whatsapp_number: whatsapp,
        announcement_text: announcement,
        instagram_url: instagram,
        hero_config: JSON.stringify(configs.hero),
        page_configs: JSON.stringify({ ...configs, _categoryItems: categoryItems }),
        updated_at: new Date().toISOString(),
      }).eq('id', row.id)

      // ── Sync categoryItems → DB categories table ──
      // So products admin and shop filters always match the visual editor
      if (categoryItems.length > 0) {
        // Get existing DB categories to avoid duplicates
        const { data: existingCats } = await supabase.from('categories').select('id, slug')
        const existingSlugs = new Set((existingCats ?? []).map((c: any) => c.slug))

        // Upsert each visible category item into DB
        for (const item of categoryItems) {
          const slug = item.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (!slug) continue
          if (existingSlugs.has(slug)) {
            // Update name only (slug stays stable as the key)
            await supabase.from('categories')
              .update({ name: item.name.charAt(0).toUpperCase() + item.name.slice(1) })
              .eq('slug', slug)
          } else {
            // Insert new category
            await supabase.from('categories').insert({
              name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
              slug,
              description: null,
            })
          }
        }

        // Remove DB categories that no longer exist in categoryItems
        const activeSlugs = categoryItems.map(c =>
          c.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        ).filter(Boolean)
        const toRemove = (existingCats ?? []).filter((c: any) => !activeSlugs.includes(c.slug))
        for (const cat of toRemove) {
          // Only delete if no products are assigned to it
          const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', cat.id)
          if (!count || count === 0) {
            await supabase.from('categories').delete().eq('id', cat.id)
          }
        }
      }

      await fetch('/api/revalidate', { method: 'POST' }).catch(() => null)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  const pages: PageId[] = ['hero', 'featured_moments', 'categories', 'carousel', 'collections', 'footer']

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Barlow, sans-serif', background: '#f0efed' }}>

      {/* Top bar */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #e8e8e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 24, margin: 0 }}>Landing Page Editor</h1>
          <p style={{ fontSize: 11, color: '#aaa', margin: '1px 0 0' }}>Edit every section of your storefront</p>
        </div>
        <div style={{ display: 'flex', gap: 3, background: '#f0efed', padding: 3, borderRadius: 12 }}>
          {([['pages','Page Editor', Monitor],['store','Store Info',Settings],['announcement','Announcement',Bell]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id as Tab)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 9, border: 'none', background: tab === id ? '#fff' : 'transparent',
              color: tab === id ? '#0d0d0d' : '#888', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', fontFamily: 'Barlow, sans-serif',
              boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
            }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
          borderRadius: 40, border: 'none', background: saved ? '#16a34a' : '#0d0d0d',
          color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <Save size={14} />{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save All'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── PAGE EDITOR ── */}
        {tab === 'pages' && (
          <>
            {/* Left sidebar — page list */}
            <div style={{ width: 170, background: '#fff', borderRight: '1px solid #e8e8e5', overflowY: 'auto', flexShrink: 0, padding: '10px 6px' }}>
              <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', padding: '4px 8px 10px', fontFamily: 'Barlow, sans-serif' }}>PAGES</p>
              {pages.map(pid => {
                const c = configs[pid]
                const active = activePage === pid
                return (
                  <button key={pid} onClick={() => { setActivePage(pid); setSelectedEl(null) }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 10px', border: 'none', cursor: 'pointer', borderRadius: 10,
                    background: active ? '#f0efed' : 'transparent',
                    borderLeft: active ? `3px solid #f04e0f` : '3px solid transparent',
                    fontFamily: 'Barlow, sans-serif', textAlign: 'left', marginBottom: 2,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: active ? '#0d0d0d' : '#666', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{c.elements.length} elements</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Center — canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', background: '#e8e7e4' }}>

              {/* Info banner */}
              <div style={{ background: '#fffbe6', border: '1px solid #f0d060', borderRadius: 8, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>💡</span>
                <span style={{ fontSize: 11, color: '#7a6000', fontFamily: 'Barlow, sans-serif', lineHeight: 1.5 }}>
                  <strong>Image slots are empty</strong> — live page shows product DB images as fallback. Upload images here to override them. Text & color changes apply instantly after Save.
                </span>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Move size={12} color="#888" />
                  <span style={{ fontSize: 11, color: '#888', fontFamily: 'Barlow, sans-serif' }}>Drag to reposition · Click to select · Edit in panel →</span>
                </div>
                <button onClick={() => { setConfigs(c => ({ ...c, [activePage]: { ...DEFAULTS[activePage] } })); setSelectedEl(null) }} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  borderRadius: 8, border: '1px solid #ddd', background: '#fff',
                  cursor: 'pointer', fontSize: 11, fontFamily: 'Barlow, sans-serif', color: '#666',
                }}>
                  <RotateCcw size={11} /> Reset Page
                </button>
              </div>

              {/* Visibility chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                {cfg.elements.map(e => (
                  <button key={e.id} onClick={() => updateEl(e.id, { visible: !e.visible })} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: e.visible ? '#0d0d0d' : '#e0e0de',
                    color: e.visible ? '#fff' : '#888',
                    fontSize: 10, fontFamily: 'Barlow, sans-serif', transition: 'all 0.15s',
                  }}>
                    {e.visible ? <Eye size={9} /> : <EyeOff size={9} />}{e.label}
                  </button>
                ))}
              </div>

              {/* Canvas — inject _items for categories page */}
              <PageCanvas
                config={activePage === 'categories' ? { ...cfg, _items: categoryItems } as any : cfg}
                selectedId={selectedEl}
                onSelect={setSelectedEl}
                onDrag={handleDrag}
              />

              {/* Page colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, background: '#fff', borderRadius: 12, padding: 14 }}>
                {[
                  { label: 'Page Background', key: 'bgColor' as const, val: cfg.bgColor },
                  { label: 'Accent Color', key: 'accentColor' as const, val: cfg.accentColor },
                ].map(item => (
                  <div key={item.key}>
                    <label style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 8, fontFamily: 'Barlow, sans-serif' }}>{item.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={item.val}
                        onChange={e => setConfigs(c => ({ ...c, [activePage]: { ...c[activePage], [item.key]: e.target.value } }))}
                        style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      <code style={{ fontSize: 11, color: '#666' }}>{item.val}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — properties panel */}
            <div style={{ width: 230, borderLeft: '1px solid #e8e8e5', background: '#fff', overflowY: 'auto', padding: 14, flexShrink: 0 }}>

              {/* ── CATEGORIES SPECIAL PANEL ── */}
              {activePage === 'categories' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f0ee' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Category Items</p>
                    <button onClick={addCatItem} style={{ background: '#f04e0f', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Barlow,sans-serif', fontWeight: 600 }}>+ Add</button>
                  </div>

                  {/* Category list */}
                  {categoryItems.map((cat, idx) => (
                    <div key={cat.id} style={{
                      border: `1.5px solid ${selectedCatId === cat.id ? '#f04e0f' : '#e8e8e5'}`,
                      borderRadius: 8, marginBottom: 8, overflow: 'hidden',
                      opacity: cat.visible ? 1 : 0.45,
                    }}>
                      {/* Header row — clicking this toggles expanded */}
                      <div
                        onClick={() => setSelectedCatId(cat.id === selectedCatId ? null : cat.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: selectedCatId === cat.id ? '#fff8f6' : '#fff', cursor: 'pointer' }}
                      >
                        {/* Drag order */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); moveCatItem(cat.id, -1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 9, color: '#ccc', lineHeight: 1 }}>▲</button>
                          <button onClick={e => { e.stopPropagation(); moveCatItem(cat.id, 1) }}  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 9, color: '#ccc', lineHeight: 1 }}>▼</button>
                        </div>
                        {/* Thumbnail */}
                        <div style={{ width: 32, height: 32, borderRadius: 4, background: cat.imageUrl ? `url(${cat.imageUrl}) center/cover` : '#e8e8e5', flexShrink: 0, overflow: 'hidden' }}>
                          {!cat.imageUrl && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={12} color="#ccc" /></div>}
                        </div>
                        {/* Name */}
                        <span style={{ fontSize: 12, fontFamily: 'Barlow,sans-serif', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                        {/* Visibility */}
                        <button onClick={e => { e.stopPropagation(); updateCatItem(cat.id, { visible: !cat.visible }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                          {cat.visible ? <Eye size={14} color="#0d0d0d" /> : <EyeOff size={14} color="#ccc" />}
                        </button>
                        {/* Delete */}
                        <button onClick={e => { e.stopPropagation(); if (confirm('Remove this category?')) removeCatItem(cat.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, color: '#ccc', flexShrink: 0, lineHeight: 1 }}>×</button>
                      </div>

                      {/* Expanded editor — stopPropagation prevents parent onClick from toggling closed */}
                      {selectedCatId === cat.id && (
                        <div onClick={e => e.stopPropagation()} style={{ padding: '10px 10px 12px', borderTop: '1px solid #f0f0ee', background: '#fafaf9' }}>
                          {/* Name */}
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5, fontFamily: 'Barlow,sans-serif' }}>Name</label>
                            <input value={cat.name} onChange={e => updateCatItem(cat.id, { name: e.target.value })} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 12, fontFamily: 'Barlow,sans-serif', outline: 'none', boxSizing: 'border-box' as const }} />
                          </div>

                          {/* Count */}
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5, fontFamily: 'Barlow,sans-serif' }}>Count</label>
                            <input type="number" value={cat.count} onChange={e => updateCatItem(cat.id, { count: +e.target.value })} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }} />
                          </div>

                          {/* Font size */}
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5, fontFamily: 'Barlow,sans-serif' }}>Font Size: {cat.fontSize}px</label>
                            <input type="range" min={16} max={120} value={cat.fontSize} onChange={e => updateCatItem(cat.id, { fontSize: +e.target.value })} style={{ width: '100%' }} />
                          </div>

                          {/* Color */}
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5, fontFamily: 'Barlow,sans-serif' }}>Color</label>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={cat.color} onChange={e => updateCatItem(cat.id, { color: e.target.value })} style={{ width: 30, height: 30, border: '1px solid #e8e8e5', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                              <input type="text" value={cat.color} onChange={e => updateCatItem(cat.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 7px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                            </div>
                          </div>

                          {/* Image */}
                          <div>
                            <label style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5, fontFamily: 'Barlow,sans-serif' }}>Category Image</label>
                            {cat.imageUrl ? (
                              <div style={{ position: 'relative' }}>
                                <img src={cat.imageUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                                <button onClick={() => updateCatItem(cat.id, { imageUrl: '' })} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}>×</button>
                              </div>
                            ) : (
                              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px dashed #e0e0de', borderRadius: 6, padding: '12px 8px', cursor: 'pointer', gap: 4 }}>
                                <ImageIcon size={16} color="#ccc" />
                                <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'Barlow,sans-serif' }}>{uploadingCatImg === cat.id ? 'Uploading...' : 'Upload image'}</span>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleCatImageUpload(e, cat.id)} disabled={uploadingCatImg !== null} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <p style={{ fontSize: 10, color: '#aaa', marginTop: 12, lineHeight: 1.6, fontFamily: 'Barlow,sans-serif' }}>
                    ▲▼ reorder · 👁 show/hide · × delete<br/>Click item to edit name, size, color, image
                  </p>
                </div>

              ) : (
                /* ── GENERIC ELEMENT PANEL (all other pages) ── */
                !selEl ? (
                  <div style={{ textAlign: 'center', paddingTop: 60, color: '#ccc' }}>
                    <Layers size={26} style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>Click an element<br/>on the canvas to edit</p>
                  </div>
                ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0ee' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{selEl.label}</p>
                    <button onClick={() => updateEl(selEl.id, { visible: !selEl.visible })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: selEl.visible ? '#0d0d0d' : '#ccc' }}>
                      {selEl.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  {/* Position controls */}
                  <PropRow label="Position X (%)">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" min={0} max={92} value={selEl.x} onChange={e => updateEl(selEl.id, { x: +e.target.value })} style={{ flex: 1 }} />
                      <input type="number" value={selEl.x} onChange={e => updateEl(selEl.id, { x: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                    </div>
                  </PropRow>
                  <PropRow label="Position Y (%)">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" min={0} max={92} value={selEl.y} onChange={e => updateEl(selEl.id, { y: +e.target.value })} style={{ flex: 1 }} />
                      <input type="number" value={selEl.y} onChange={e => updateEl(selEl.id, { y: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                    </div>
                  </PropRow>

                  {selEl.isImage ? (
                    <>
                      {/* Image upload */}
                      <PropRow label="Image">
                        {selEl.imageUrl ? (
                          <div style={{ position: 'relative', marginBottom: 8 }}>
                            <img src={selEl.imageUrl} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} />
                            <button onClick={() => updateEl(selEl.id, { imageUrl: '' })} style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>×</button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0de', borderRadius: 8, padding: '18px 12px', cursor: 'pointer', gap: 6, marginBottom: 8 }}>
                            <ImageIcon size={20} color="#ccc" />
                            <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Barlow, sans-serif' }}>{uploadingImg ? 'Uploading...' : 'Click to upload'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, selEl.id)} disabled={uploadingImg} />
                          </label>
                        )}
                      </PropRow>
                      <PropRow label="Width (% of page)">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={5} max={60} value={selEl.width ?? 20} onChange={e => updateEl(selEl.id, { width: +e.target.value })} style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selEl.width ?? 20}%</span>
                        </div>
                      </PropRow>
                      <PropRow label="Height (% of canvas)">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={5} max={100} value={selEl.height ?? 30} onChange={e => updateEl(selEl.id, { height: +e.target.value })} style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: '#666' }}>{selEl.height ?? 30}%</span>
                        </div>
                      </PropRow>
                      <PropRow label={`Zoom: ${Math.round((selEl.zoom ?? 1) * 100)}%`}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min={50} max={200} step={1} value={Math.round((selEl.zoom ?? 1) * 100)} onChange={e => updateEl(selEl.id, { zoom: +e.target.value / 100 })} style={{ flex: 1 }} />
                          <button onClick={() => updateEl(selEl.id, { zoom: 1 })} style={{ fontSize: 10, color: '#aaa', background: 'none', border: '1px solid #e8e8e5', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Reset</button>
                        </div>
                      </PropRow>
                      <PropRow label="Image Focus (object-position)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
                          {[
                            { label: 'Top',    val: 'top center' },
                            { label: 'Center', val: 'center center' },
                            { label: 'Bottom', val: 'bottom center' },
                            { label: 'Left',   val: 'center left' },
                            { label: 'Right',  val: 'center right' },
                            { label: 'Top L',  val: 'top left' },
                          ].map(opt => (
                            <button key={opt.val} onClick={() => updateEl(selEl.id, { objectPosition: opt.val })} style={{ padding: '5px 4px', fontSize: 10, borderRadius: 5, border: `1px solid ${(selEl.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#e8e8e5'}`, background: (selEl.objectPosition ?? 'top center') === opt.val ? '#fff4f0' : '#fff', cursor: 'pointer', color: (selEl.objectPosition ?? 'top center') === opt.val ? '#f04e0f' : '#666', fontFamily: 'Barlow, sans-serif' }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <input type="text" value={selEl.objectPosition ?? 'top center'} onChange={e => updateEl(selEl.id, { objectPosition: e.target.value })} placeholder="e.g. 50% 20%" style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const }} />
                      </PropRow>
                      <PropRow label="Placeholder Color">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={selEl.color ?? '#dddddd'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input type="text" value={selEl.color ?? '#dddddd'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      </PropRow>
                    </>
                  ) : (
                    <>
                      {selEl.fontSize !== undefined && (
                        <PropRow label="Font Size (px)">
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="range" min={7} max={120} value={selEl.fontSize} onChange={e => updateEl(selEl.id, { fontSize: +e.target.value })} style={{ flex: 1 }} />
                            <input type="number" value={selEl.fontSize} onChange={e => updateEl(selEl.id, { fontSize: +e.target.value })} style={{ width: 44, border: '1px solid #e8e8e5', borderRadius: 6, padding: '4px 6px', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                          </div>
                        </PropRow>
                      )}
                      <PropRow label="Text Color">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={selEl.color ?? '#000000'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ width: 34, height: 34, border: '1px solid #e8e8e5', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input type="text" value={selEl.color ?? '#000000'} onChange={e => updateEl(selEl.id, { color: e.target.value })} style={{ flex: 1, border: '1px solid #e8e8e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                        </div>
                      </PropRow>
                      {selEl.content !== undefined && (
                        <PropRow label="Content">
                          <textarea value={selEl.content} onChange={e => updateEl(selEl.id, { content: e.target.value })} rows={3} style={{ width: '100%', border: '1px solid #e8e8e5', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'Barlow, sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' as const }} />
                        </PropRow>
                      )}
                    </>
                  )}

                  <button onClick={() => { const d = DEFAULTS[activePage].elements.find(x => x.id === selEl.id); if (d) updateEl(selEl.id, { x: d.x, y: d.y }) }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #e8e8e5', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow, sans-serif', color: '#666', marginTop: 6 }}>
                    ↺ Reset Position
                  </button>
                </>
              )
              )} {/* end categories ternary */}
            </div>
          </>
        )}

        {/* ── STORE INFO ── */}
        {tab === 'store' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 520, background: '#fff', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 28 }}>Store Details</h2>
              <Field label="Brand Name" value={brandName} onChange={setBrandName} />
              <Field label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} placeholder="919876543210" hint="Country code + number, no + sign" />
              <Field label="Instagram URL" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/calvac" />
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENT ── */}
        {tab === 'announcement' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 520, background: '#fff', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Announcement Bar</h2>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>Shown at top of every page. Leave blank to hide.</p>
              <Field label="Announcement Text" value={announcement} onChange={setAnnouncement} multiline placeholder="Free shipping on orders above ₹2000 · New drop every Friday" />
              {announcement && (
                <div style={{ marginTop: 16, background: '#0d0d0d', borderRadius: 8, padding: '10px 16px', textAlign: 'center', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
                  {announcement}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
