import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'

async function getRecentListings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings?page=1`, { cache: 'no-store' })
    const data = await res.json()
    return data.listings || []
  } catch { return [] }
}

export default async function HomePage() {
  const listings = await getRecentListings()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Find it.<br />
              Buy it.<br />
              <span>Pass it on.</span>
            </h1>
            <p className="hero-subtitle">
              Trove is a modern second-hand marketplace. Discover pre-loved items from people in your city — or list yours in minutes.
            </p>
            <div className="hero-actions">
              <Link href="/browse" className="btn btn-primary btn-lg">Browse Listings</Link>
              <Link href="/listings/new" className="btn btn-outline btn-lg">Start Selling</Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">{listings.length}+</div>
                <div className="hero-stat-label">Active listings</div>
              </div>
              <div>
                <div className="hero-stat-num">15</div>
                <div className="hero-stat-label">Categories</div>
              </div>
              <div>
                <div className="hero-stat-num">Free</div>
                <div className="hero-stat-label">Always free to list</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="section" style={{ background: '#F8F7F4' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Listings</h2>
              <Link href="/browse" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {listings.length > 0 ? (
              <div className="listing-grid">
                {listings.slice(0, 6).map(l => <ListingCard key={l._id} listing={l} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No listings yet</div>
                <p>Be the first to list something!</p>
                <Link href="/listings/new" className="btn btn-primary" style={{ marginTop: 16 }}>List an item</Link>
              </div>
            )}
          </div>
        </section>

        {/* ISO Board CTA */}
        <section style={{ background: 'var(--bg)', padding: '60px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="badge badge-accent" style={{ marginBottom: 12 }}>New Feature</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: 12 }}>
                Can't find what you're looking for?
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
                Post a "Want" on the ISO Board. When a matching item is listed, you'll get an instant notification — no more checking back every day.
              </p>
              <Link href="/iso" className="btn btn-primary">Post a Want →</Link>
            </div>
            <div style={{ flex: 1, minWidth: 280, background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>ISO Board</div>
              {[
                { item: 'Sony WH-1000XM4 Headphones', budget: '₹12,000', cat: 'electronics' },
                { item: 'Mechanical keyboard TKL', budget: '₹5,000', cat: 'electronics' },
                { item: 'Calvin Klein Jeans 32x32', budget: '₹1,500', cat: 'clothing' },
              ].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border-dark)' : 'none' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔍</span>
                  <div>
                    <div style={{ color: 'var(--text-light)', fontWeight: 500, fontSize: '0.9rem' }}>{w.item}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Budget: {w.budget}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#080E1A', padding: '32px 0', color: 'var(--text-muted)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>Trove.</div>
            <div style={{ fontSize: '0.85rem' }}>Made with ♥ for the second-hand economy</div>
          </div>
        </footer>
      </main>
    </>
  )
}
