'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SmartTemplate from '@/components/SmartTemplate'

const CATEGORIES = ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other']
const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor']

export default function NewListingPage() {
  const [form, setForm] = useState({ title: '', price: '', category: '', condition: '', location: '' })
  const [description, setDescription] = useState('')
  const [templateData, setTemplateData] = useState({})
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) router.push('/auth/login')
    })
  }, [router])

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 3)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function handleTemplateChange(desc, data) {
    setDescription(desc)
    setTemplateData(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) { setError('Please fill in the description fields'); return }
    setLoading(true); setError('')
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

      const res = await fetch('/api/listings', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error creating listing'); return }
      router.push(`/listings/${data.listing._id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title">List an Item</h1>
            <p className="page-subtitle">Fill in the details below to post your listing</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Item Details</h3>

                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input id="listing-title" className="form-input" placeholder="e.g. Sony WH-1000XM4 Wireless Headphones" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select id="listing-category" className="form-input form-select" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select id="listing-condition" className="form-input form-select" value={form.condition}
                      onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} required>
                      <option value="">Select condition</option>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input id="listing-price" className="form-input" type="number" min="0" placeholder="e.g. 12000" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input id="listing-location" className="form-input" placeholder="e.g. Bangalore" value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Template */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Description</h3>
                <SmartTemplate category={form.category} onChange={handleTemplateChange} />
              </div>
            </div>

            {/* Images */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>Photos</h3>
                <p className="form-hint" style={{ marginBottom: 16 }}>Upload up to 3 photos. First photo will be the cover.</p>
                <input id="listing-images" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ marginBottom: 16 }} />
                {previews.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {previews.map((p, i) => (
                      <img key={i} src={p} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <div style={{ color: 'var(--danger)', marginTop: 12, fontWeight: 500 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button id="submit-listing" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
