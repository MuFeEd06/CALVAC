'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'signup'

interface Props { mode: Mode }

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        // Auto sign in after signup
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw signInErr
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #e8e8e5', fontSize: 14,
    fontFamily: 'Barlow, sans-serif', outline: 'none',
    background: '#fafaf9', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '2px',
    textTransform: 'uppercase', color: '#888',
    display: 'block', marginBottom: 6,
    fontFamily: 'Barlow, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Barlow, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '8px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d' }}>
            CALVAC
          </Link>
          <p style={{ marginTop: 8, fontSize: 13, color: '#888' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit}>

            {mode === 'signup' && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name" required style={inp}
                />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inp}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'} required
                minLength={6} style={inp}
              />
            </div>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 40, border: 'none', background: loading ? '#ccc' : '#0d0d0d', color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Barlow, sans-serif', transition: 'background 0.2s' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#888' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <Link href={`/signup${redirect !== '/' ? `?redirect=${redirect}` : ''}`} style={{ color: '#f04e0f', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
              </>
            ) : (
              <>Already have an account?{' '}
                <Link href={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} style={{ color: '#f04e0f', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>← Back to store</Link>
        </div>
      </div>
    </div>
  )
}
