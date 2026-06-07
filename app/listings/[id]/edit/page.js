'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SmartTemplate from '@/components/SmartTemplate'

const CATEGORIES = ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other']
const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor']

export default function EditListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', price: '', category: '', condition: '', location: '' })
  const [description, setDescription] = useState('')
  const [templateData, setTemplateData] = useState({})
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/listings/${id}`).then(r => r.json()).then(d => {
      if (!d.listing) { router.push('/dashboard'); return }
      const l = d.listing
      setForm({ title: l.title, price: l.price, category: l.category, condition: l.condition, location: l.location || '' })
      setDescription(l.description)
      setTemplateData(l.templateData || {})
      setExistingImages(l.images || [])
      setLoading(false)
    })
  }, [id, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', description)
      fd.append('price', form.price)
      fd.append('category', form.category)
      fd.append('condition', form.condition)
      fd.append('location', form.location)
      fd.append('templateData', JSON.stringify(templateData))
      images.forEach(img => fd.append('images', img))
      const res = await fetch(`/api/listings/${id}`, { method: 'PUT', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error updating'); return }
      router.push(`/listings/${id}`)
    } catch { setError('Something went wrong.') }
    setSaving(false)
  }

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></>

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title">Edit Listing</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select className="form-input form-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} required>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Description</h3>
                <SmartTemplate category={form.category} onChange={(desc, data) => { setDescription(desc); setTemplateData(data) }} />
                {description && (
                  <div style={{ marginTop: 12 }}>
                    <label className="form-label">Current description</label>
                    <div className="template-preview has-content">{description}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>Photos</h3>
                {existingImages.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {existingImages.map((img, i) => <img key={i} src={img} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }} />)}
                  </div>
                )}
                <p className="form-hint">Upload new photos to replace existing ones</p>
                <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0, 3))} style={{ marginTop: 8 }} />
              </div>
            </div>

            {error && <div style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => router.push(`/listings/${id}`)}>Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
