'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import { Suspense } from 'react'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'listings'
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState(initialTab)
  const [myListings, setMyListings] = useState([])
  const [saved, setSaved] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState({})
  const [history, setHistory] = useState({ buyerHistory: [], sellerHistory: [] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t) setTab(t)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/auth/login'); return }
      setUser(d.user)
      Promise.all([
        fetch(`/api/profile/${d.user._id}`).then(r => r.json()),
        fetch('/api/saved').then(r => r.json()),
        fetch('/api/inquiries').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/history').then(r => r.json()),
      ]).then(([pd, sd, id, nd, hd]) => {
        setMyListings(pd.listings || [])
        setSaved(sd.saved || [])
        setInquiries(id.inquiries || [])
        setNotifications(nd.notifications || [])
        setUnreadCount(nd.unreadCount || 0)
        setHistory({ buyerHistory: hd.buyerHistory || [], sellerHistory: hd.sellerHistory || [] })
        setLoading(false)
        pd.listings?.forEach(l => {
          fetch(`/api/listings/${l._id}/stats`).then(r => r.json()).then(s => {
            setStats(prev => ({ ...prev, [l._id]: s }))
          }).catch(() => {})
        })
      })
    })
  }, [router])

  async function markNotifRead(id) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    await fetch('/api/notifications/all', { method: 'DELETE' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const [confirmSold, setConfirmSold] = useState(null)  // listingId awaiting confirm
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleMarkSold(listingId) {
    const res = await fetch(`/api/listings/${listingId}/sold`, { method: 'PATCH' })
    if (res.ok) setMyListings(prev => prev.map(l => l._id === listingId ? { ...l, status: 'sold' } : l))
    setConfirmSold(null)
  }

  async function handleDelete(listingId) {
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
    if (res.ok) setMyListings(prev => prev.filter(l => l._id !== listingId))
    setConfirmDelete(null)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>

  const tabBtn = (t, label, count) => (
    <button
      className={`tab ${tab === t ? 'active' : ''}`}
      onClick={() => setTab(t)}
      id={`dashboard-tab-${t}`}
    >
      {label}
      {count > 0 && (
        <span style={{ fontSize: '0.72rem', background: 'var(--accent)', color: '#fff', borderRadius: 100, padding: '1px 7px', marginLeft: 6 }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <Link href="/listings/new" className="btn btn-primary">+ List New Item</Link>
      </div>

      <div className="tabs">
        {tabBtn('listings', 'My Listings', myListings.length)}
        {tabBtn('saved', 'Saved', saved.length)}
        {tabBtn('messages', 'Messages', inquiries.filter(inq => {
          const lastMsg = inq.messages?.slice(-1)[0]
          if (!lastMsg) return false
          const lastSenderId = lastMsg.sender?._id?.toString() || lastMsg.sender?.toString()
          return lastSenderId !== user?._id  // other person replied last = unread
        }).length)}
        {tabBtn('notifications', 'Notifications', unreadCount)}
        {tabBtn('history', 'History', history.buyerHistory.length + history.sellerHistory.length)}
      </div>

      {/* MY LISTINGS */}
      {tab === 'listings' && (
        <div>
          {myListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No listings yet</div>
              <Link href="/listings/new" className="btn btn-primary" style={{ marginTop: 16 }}>Create your first listing</Link>
            </div>
          ) : (
            myListings.map(l => (
              <div key={l._id}>
                <div className="dashboard-listing-row">
                  {l.images?.[0]
                    ? <img src={l.images[0]} alt="" className="dashboard-listing-img" />
                    : <div className="dashboard-listing-img" style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                  }
                  <div className="dashboard-listing-info">
                    <Link href={`/listings/${l._id}`} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{l.title}</Link>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>₹{l.price?.toLocaleString('en-IN')}</div>
                    <div>
                      {l.status === 'sold'
                        ? <span className="badge badge-success">Sold</span>
                        : <span className="badge badge-info">Active</span>
                      }
                    </div>
                  </div>
                  <div className="dashboard-listing-actions">
                    <Link href={`/listings/${l._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                    {l.status === 'active' && (
                      confirmSold === l._id ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mark sold?</span>
                          <button onClick={() => handleMarkSold(l._id)} className="btn btn-primary btn-sm">Yes</button>
                          <button onClick={() => setConfirmSold(null)} className="btn btn-ghost btn-sm">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmSold(l._id)} className="btn btn-sm" style={{ background: '#1e293b', color: '#f8fafc', border: '1.5px solid #334155' }}>Mark Sold</button>
                      )
                    )}
                    {confirmDelete === l._id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Delete?</span>
                        <button onClick={() => handleDelete(l._id)} className="btn btn-danger btn-sm">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(l._id)} className="btn btn-danger btn-sm">Delete</button>
                    )}
                  </div>
                </div>
                {stats[l._id] && (
                  <div style={{ paddingLeft: 78, paddingBottom: 8 }}>
                    <div className="listing-stats">
                      <span>👁 {stats[l._id].views ?? l.viewCount ?? 0} views</span>
                      <span>🤍 {stats[l._id].saves ?? 0} saves</span>
                      <span>💬 {stats[l._id].inquiries ?? 0} inquiries</span>
                    </div>
                    {(stats[l._id].views ?? 0) > 20 && (stats[l._id].inquiries ?? 0) === 0 && (
                      <div className="listing-hint">⚠️ High views but no inquiries — consider lowering your price or adding more photos.</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SAVED */}
      {tab === 'saved' && (
        saved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤍</div>
            <div className="empty-state-title">No saved listings</div>
            <Link href="/browse" className="btn btn-primary" style={{ marginTop: 16 }}>Browse listings</Link>
          </div>
        ) : (
          <div className="listing-grid">
            {saved.map(s => s.listingId && <ListingCard key={s._id} listing={s.listingId} isSaved={true} currentUserId={user?._id} />)}
          </div>
        )
      )}

      {/* MESSAGES */}
      {tab === 'messages' && (
        inquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">No messages yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inquiries.map(inq => (
              <Link key={inq._id} href={`/listings/${inq.listingId?._id}?thread=open`}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  <div className="card-body" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {inq.listingId?.images?.[0]
                      ? <img src={inq.listingId.images[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      : <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📦</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.95rem' }}>{inq.listingId?.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                        {(() => {
                          const otherPerson = inq.buyerId?._id === user?._id ? inq.sellerId?.name : inq.buyerId?.name
                          const lastMsg = inq.messages?.slice(-1)[0]
                          const lastSenderId = lastMsg?.sender?._id?.toString() || lastMsg?.sender?.toString()
                          const hasNewReply = lastSenderId && lastSenderId !== user?._id
                          return (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              💬 with <strong style={{ color: 'var(--text-primary)' }}>{otherPerson}</strong>
                              {hasNewReply && <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: 100, fontWeight: 700 }}>New reply</span>}
                            </span>
                          )
                        })()}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inq.messages?.slice(-1)[0]?.text?.slice(0, 70)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(inq.updatedAt || inq.createdAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={markAllRead} className="btn btn-ghost btn-sm">Mark all as read</button>
            </div>
          )}
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <div className="empty-state-title">No notifications yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => {
                    markNotifRead(n._id)
                    if (n.listingId) window.location.href = `/listings/${n.listingId._id || n.listingId}`
                  }}
                  style={{
                    padding: '14px 18px', borderRadius: 'var(--radius-sm)',
                    background: n.read ? '#f8f9fa' : '#fff7ed',
                    border: `1.5px solid ${n.read ? 'var(--border)' : 'var(--accent)'}`,
                    cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>
                    {n.type === 'iso_match' ? '🔍' : n.type === 'price_drop' ? '📉' : '💬'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Buyer History */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              🛒 Items I Bought <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>({history.buyerHistory.length})</span>
            </h3>
            {history.buyerHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🛍️</div>
                <div className="empty-state-title">No purchases yet</div>
                <div className="empty-state-subtitle">Items you buy will appear here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.buyerHistory.map(item => (
                  <div key={item.offerId} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                    {item.listing?.images?.[0] && <img src={item.listing.images[0]} alt={item.listing?.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{item.listing?.title || 'Listing'}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Seller: {item.listing?.sellerId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent)' }}>₹{item.paidAmount?.toLocaleString('en-IN')}</div>
                      {item.savedAmount > 0 && <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>saved ₹{item.savedAmount.toLocaleString('en-IN')}</div>}
                      {item.listedPrice !== item.paidAmount && item.savedAmount <= 0 && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>listed at ₹{item.listedPrice?.toLocaleString('en-IN')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seller History */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              🏷️ Items I Sold <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>({history.sellerHistory.length})</span>
            </h3>
            {history.sellerHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">No sales yet</div>
                <div className="empty-state-subtitle">Listings you sell will appear here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.sellerHistory.map(item => (
                  <div key={item.listingId} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                    {item.images?.[0] && <img src={item.images[0]} alt={item.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{item.title}</div>
                      {item.buyer && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sold to: {item.buyer.name}</div>}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent)' }}>₹{item.soldFor?.toLocaleString('en-IN')}</div>
                      {item.listedPrice !== item.soldFor && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>listed at ₹{item.listedPrice?.toLocaleString('en-IN')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
    </>
  )
}
