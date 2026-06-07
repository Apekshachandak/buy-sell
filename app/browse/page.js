'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import { useSearchParams, useRouter } from 'next/navigation'

const CATEGORIES = ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other']

function BrowseContent() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setCurrentUserId(d.user._id)
    }).catch(() => {})
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('page', page)

    async function attempt(left) {
      try {
        const res = await fetch(`/api/listings?${params}`)
        const data = await res.json()
        if (!res.ok) {
          if (left > 1) { await new Promise(r => setTimeout(r, 1000)); return attempt(left - 1) }
          return
        }
        setListings(data.listings || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      } catch {
        if (left > 1) { await new Promise(r => setTimeout(r, 1000)); return attempt(left - 1) }
      }
    }

    await attempt(3)
    setLoading(false)
  }, [search, category, minPrice, maxPrice, page])


  useEffect(() => { fetchListings() }, [fetchListings])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    fetchListings()
  }

  return (
    <>
      <Navbar />
      <main className="page" style={{ background: '#F8F7F4' }}>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Browse Listings</h1>
            <p className="page-subtitle">{total} items available</p>
          </div>

          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 260 }}>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="browse-search"
                />
                <button type="submit">Search</button>
              </div>
            </form>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="form-input" style={{ width: 100 }} placeholder="Min ₹" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }} type="number" />
              <input className="form-input" style={{ width: 100 }} placeholder="Max ₹" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }} type="number" />
            </div>
          </div>

          {/* Category pills */}
          <div className="category-pills" style={{ marginBottom: 28 }}>
            <button className={`category-pill ${!category ? 'active' : ''}`} onClick={() => { setCategory(''); setPage(1) }}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} className={`category-pill ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setPage(1) }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="listing-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="listing-card">
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.filter(l => (l.sellerId?._id || l.sellerId) !== currentUserId).length > 0 ? (
            <div className="listing-grid">
              {listings
                .filter(l => (l.sellerId?._id || l.sellerId) !== currentUserId)
                .map(l => <ListingCard key={l._id} listing={l} currentUserId={currentUserId} />)
              }
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No listings found</div>
              <p>Try different filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></>}>
      <BrowseContent />
    </Suspense>
  )
}
