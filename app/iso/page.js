'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const CATEGORIES = ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other']

export default function ISOPage() {
  const [wants, setWants] = useState([])
  const [tab, setTab] = useState('browse')
  const [form, setForm] = useState({ title: '', description: '', category: 'any', maxPrice: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setCurrentUser(d.user) })
    loadWants()
  }, [])

  async function loadWants(cat = '') {
    setLoading(true)
    const params = cat ? `?category=${cat}` : ''
    const res = await fetch(`/api/wants${params}`)
    const d = await res.json()
    setWants(d.wants || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!currentUser) { router.push('/auth/login'); return }
    setSubmitting(true)
    const res = await fetch('/api/wants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, maxPrice: form.maxPrice ? Number(form.maxPrice) : null })
    })
    if (res.ok) {
      setForm({ title: '', description: '', category: 'any', maxPrice: '' })
      setTab('browse')
      loadWants()
    }
    setSubmitting(false)
  }

  async function handleDelete(id) {
    await fetch(`/api/wants/${id}`, { method: 'DELETE' })
    setWants(prev => prev.filter(w => w._id !== id))
  }

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', padding: '40px 0 48px' }}>
        <div className="container">
          <div className="badge badge-accent" style={{ marginBottom: 12 }}>ISO Board</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: 10 }}>In Search Of</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.7 }}>
            Can't find what you're looking for? Post a Want. Sellers browsing this board can reach out if they have what you need — and we'll notify you the moment a matching listing appears.
          </p>
        </div>
      </div>

      <main className="page">
        <div className="container">
          <div className="tabs">
            <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')} id="iso-browse-tab">Browse Wants</button>
            <button className={`tab ${tab === 'post' ? 'active' : ''}`} onClick={() => setTab('post')} id="iso-post-tab">+ Post a Want</button>
          </div>

          {tab === 'browse' && (
            <div>
              <div className="category-pills" style={{ marginBottom: 24 }}>
                <button className={`category-pill ${!filterCat ? 'active' : ''}`} onClick={() => { setFilterCat(''); loadWants() }}>All</button>
                {CATEGORIES.map(c => (
                  <button key={c} className={`category-pill ${filterCat === c ? 'active' : ''}`} onClick={() => { setFilterCat(c); loadWants(c) }}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                : wants.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No wants posted yet</div>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('post')}>Be the first to post a Want</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {wants.map(w => (
                      <div key={w._id} className="want-card">
                        <div className="want-card-header">
                          {w.buyerId?.avatar
                            ? <img src={w.buyerId.avatar} alt="" className="avatar avatar-sm" />
                            : <div className="avatar avatar-sm">{w.buyerId?.name?.[0]}</div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{w.buyerId?.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div className="want-card-title">🔍 {w.title}</div>
                        {w.description && <div className="want-card-desc">{w.description}</div>}
                        <div className="want-card-footer">
                          {w.category !== 'any' && <span className="badge badge-accent">{w.category}</span>}
                          {w.maxPrice && <span className="badge badge-info">Budget: ₹{w.maxPrice.toLocaleString('en-IN')}</span>}
                          {currentUser && w.buyerId?._id !== currentUser._id && (
                            <Link href={`/listings/new?title=${encodeURIComponent(w.title)}`} className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }}>I have this!</Link>
                          )}
                          {currentUser && w.buyerId?._id === currentUser._id && (
                            <button onClick={() => handleDelete(w._id)} className="btn btn-sm btn-ghost" style={{ marginLeft: 'auto', color: 'var(--danger)' }}>Remove</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {tab === 'post' && (
            <div style={{ maxWidth: 560 }}>
              <div className="card">
                <div className="card-body">
                  <h3 style={{ fontWeight: 700, marginBottom: 20 }}>What are you looking for?</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Title * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(be specific!)</span></label>
                      <input id="iso-title" className="form-input" placeholder="e.g. Sony WH-1000XM4 Headphones" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">More details</label>
                      <textarea className="form-input form-textarea" style={{ minHeight: 80 }} placeholder="Preferred condition, color, size, or anything else..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                          <option value="any">Any category</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Max budget (₹)</label>
                        <input className="form-input" type="number" min="0" placeholder="Optional" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} />
                      </div>
                    </div>
                    <button id="submit-want-btn" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                      {submitting ? 'Posting...' : currentUser ? 'Post Want' : 'Login to Post'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
