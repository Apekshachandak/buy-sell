'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StarRating from '@/components/StarRating'
import Link from 'next/link'
import { Suspense } from 'react'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Moved outside component so it's stable — fixes ObjectId vs string by using toString()
function MessageThread({ t, myId }) {
  return (
    <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      {t?.messages?.map((msg, i) => {
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString()
        const isMe = senderId === myId
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
            {!isMe && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2, paddingLeft: 4 }}>
                {msg.sender?.name || 'User'}
              </div>
            )}
            <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>{msg.text}</div>
            <div className="message-time" style={{ paddingLeft: isMe ? 0 : 4 }}>
              {timeAgo(msg.createdAt || new Date())}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Inline confirm — replaces browser confirm() dialog
function ConfirmAction({ label, onConfirm, className, children }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sure?</span>
        <button onClick={() => { setConfirming(false); onConfirm() }} className="btn btn-danger btn-sm">Yes</button>
        <button onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">No</button>
      </div>
    )
  }
  return (
    <button onClick={() => setConfirming(true)} className={className}>{children}</button>
  )
}

function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [threads, setThreads] = useState([])
  const [thread, setThread] = useState(null)
  const [activeThread, setActiveThread] = useState(null)
  const [replyMsg, setReplyMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [showBuyerReview, setShowBuyerReview] = useState(false)
  const [buyerReviewRating, setBuyerReviewRating] = useState(0)
  const [buyerReviewComment, setBuyerReviewComment] = useState('')
  // Offer state
  const [myOffer, setMyOffer] = useState(null)          // buyer's offer
  const [sellerOffers, setSellerOffers] = useState([])  // all offers (seller view)
  const [offerAmount, setOfferAmount] = useState('')
  const [counterInput, setCounterInput] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`).then(r => r.json().then(d => ({ ok: r.ok, ...d }))),
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/saved').then(r => r.json()).catch(() => ({ saved: [] })),
      fetch('/api/watched').then(r => r.json()).catch(() => ({ watched: [] })),
    ]).then(([ld, ud, sd, wd]) => {
      if (!ld.ok || !ld.listing) {
        // Server error (500) — don't show 'not found', allow retry
        if (ld.error && ld.error !== 'Listing not found') setLoadError(true)
        setLoading(false)
        return
      }
      setListing(ld.listing)
      if (ud.user) {
        const me = ud.user
        setCurrentUser(me)
        setIsSaved(sd.saved?.some(s => s.listingId?._id === id || s.listingId === id))
        setIsWatching(wd.watched?.some(w => w.listingId?._id === id || w.listingId === id))
        fetch(`/api/inquiries?listingId=${id}`).then(r => r.json()).then(d => {
          const inqs = d.inquiries || []
          const isSeller = ld.listing && me._id === ld.listing.sellerId?._id?.toString()
          if (isSeller) {
            setThreads(inqs)
            if (inqs.length > 0) setActiveThread(inqs[0])
          } else {
            const mine = inqs.find(i =>
              i.buyerId?._id?.toString() === me._id || i.buyerId?.toString() === me._id
            )
            if (mine) setThread(mine)
          }
        }).catch(() => {})
        // Fetch offers
        fetch(`/api/offers?listingId=${id}`).then(r => r.json()).then(od => {
          const isSeller = ld.listing && me._id === ld.listing.sellerId?._id?.toString()
          if (isSeller) setSellerOffers(od.offers || [])
          else if (od.offer) setMyOffer(od.offer)
        }).catch(() => {})
      }
      setLoading(false)
    }).catch(() => { setLoadError(true); setLoading(false) })
  }, [id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  async function handleSave() {
    const res = await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id }) })
    if (res.status === 401) { router.push('/auth/login'); return }
    const d = await res.json()
    setIsSaved(d.saved)
    showToast(d.saved ? 'Saved to your list ❤️' : 'Removed from saved')
  }

  async function handleWatch() {
    const res = await fetch('/api/watched', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id }) })
    if (res.status === 401) { router.push('/auth/login'); return }
    const d = await res.json()
    setIsWatching(d.watching)
    showToast(d.watching ? '🔔 Price alert set! We\'ll notify you if the price drops.' : 'Price alert removed')
  }

  async function handleInquiry(e) {
    e.preventDefault()
    if (!currentUser) { router.push('/auth/login'); return }
    setSubmitting(true)
    const res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, message: inquiryMsg }) })
    const d = await res.json()
    if (res.ok) { setThread(d.inquiry); setInquiryMsg(''); showToast('Message sent! 💬') }
    setSubmitting(false)
  }

  async function handleReply(e, threadId) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, message: replyMsg, threadId }) })
    const d = await res.json()
    if (res.ok) {
      if (isOwner) {
        setThreads(prev => prev.map(t => t._id === d.inquiry._id ? d.inquiry : t))
        setActiveThread(d.inquiry)
      } else {
        setThread(d.inquiry)
      }
      setReplyMsg('')
    }
    setSubmitting(false)
  }

  async function handleMarkSold() {
    const res = await fetch(`/api/listings/${id}/sold`, { method: 'PATCH' })
    const d = await res.json()
    if (res.ok) { setListing(d.listing); showToast('Listed marked as sold ✅'); setShowReview(true) }
  }

  async function handleDelete() {
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Listing deleted'); setTimeout(() => router.push('/dashboard'), 1000) }
  }

  async function handleReview(e) {
    e.preventDefault()
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sellerId: listing.sellerId._id, listingId: id, rating: reviewRating, comment: reviewComment, role: 'seller' }) })
    if (res.ok) { showToast('Review submitted! ⭐'); setShowReview(false) }
  }

  async function handleBuyerReview(e) {
    e.preventDefault()
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sellerId: listing.sellerId._id || listing.sellerId, listingId: id, rating: buyerReviewRating, comment: buyerReviewComment, role: 'buyer' }) })
    const d = await res.json()
    if (res.ok) { showToast('Review submitted! ⭐'); setShowBuyerReview(false) }
    else showToast(d.error || 'Could not submit review', 'error')
  }

  // ─── OFFER HANDLERS ──────────────────────────────────────────────
  async function handleMakeOffer(e) {
    e.preventDefault()
    if (!currentUser) { router.push('/auth/login'); return }
    const amt = Number(offerAmount)
    if (!amt || amt <= 0) return
    setOfferSubmitting(true)
    const res = await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, amount: amt }) })
    const d = await res.json()
    if (res.ok) { setMyOffer(d.offer); setOfferAmount(''); showToast('Offer sent! 🤝') }
    else showToast(d.error || 'Failed to send offer', 'error')
    setOfferSubmitting(false)
  }

  async function handleBuyNow() {
    if (!currentUser) { router.push('/auth/login'); return }
    setOfferSubmitting(true)
    const res = await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, buyNow: true }) })
    const d = await res.json()
    if (res.ok) { setMyOffer(d.offer); showToast('🎉 Listed price accepted! Contact details unlocked.') }
    else showToast(d.error || 'Failed', 'error')
    setOfferSubmitting(false)
  }

  async function handleOfferAction(offerId, action, counterAmount) {
    setOfferSubmitting(true)
    const body = { action }
    if (counterAmount) body.counterAmount = Number(counterAmount)
    const res = await fetch(`/api/offers/${offerId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await res.json()
    if (res.ok) {
      if (isOwner) {
        setSellerOffers(prev => prev.map(o => o._id === offerId ? d.offer : o))
      } else {
        // Buyer declining a counter → reset to fresh offer form (listing still active)
        if (action === 'decline-counter') {
          setMyOffer(null)
          showToast('Counter declined. You can make a new offer anytime.')
        } else {
          setMyOffer(d.offer)
          const msgs = { 'accept-counter': 'Counter accepted! 🎉' }
          showToast(msgs[action] || 'Done')
        }
      }
      if (isOwner) {
        const msgs = { accept: 'Offer accepted! 🎉', decline: 'Offer declined', counter: 'Counter sent!' }
        showToast(msgs[action] || 'Done')
      }
      setCounterInput('')
    } else showToast(d.error || 'Something went wrong', 'error')
    setOfferSubmitting(false)
  }

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></>
  if (loadError) return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Could not load this listing</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>This might be a temporary connection issue. Please try again.</div>
        <button className="btn btn-primary" onClick={() => { setLoadError(false); setLoading(true); window.location.reload() }}>Retry</button>
      </div>
    </>
  )
  if (!listing) return <><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Listing not found</div></>

  const isOwner = currentUser && currentUser._id === listing.sellerId?._id?.toString()
  const seller = listing.sellerId

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
            {/* LEFT */}
            <div>
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16, background: '#f1f5f9', aspectRatio: '4/3', position: 'relative' }}>
                {listing.images?.length > 0
                  ? <img src={listing.images[activeImg]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>📦</div>
                }
                {listing.status === 'sold' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: '#374151', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 700, padding: '10px 24px', borderRadius: 100, letterSpacing: 2 }}>SOLD</span>
                  </div>
                )}
              </div>
              {listing.images?.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {listing.images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === activeImg ? '2px solid var(--accent)' : '2px solid transparent', opacity: i === activeImg ? 1 : 0.6, transition: 'all 0.2s' }} />
                  ))}
                </div>
              )}
              <div className="card">
                <div className="card-body">
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>{listing.title}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span className="badge badge-accent">{listing.category}</span>
                    <span className="badge badge-info">{listing.condition}</span>
                    {listing.location && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {listing.location}</span>}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>· {timeAgo(listing.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 16 }}>₹{listing.price?.toLocaleString('en-IN')}</div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{listing.description}</div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Seller */}
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    {seller?.avatar
                      ? <img src={seller.avatar} alt={seller.name} className="avatar avatar-md" />
                      : <div className="avatar avatar-md">{seller?.name?.[0]}</div>
                    }
                    <div>
                      <div style={{ fontWeight: 700 }}>{seller?.name}</div>
                      <StarRating rating={seller?.avgRating || 0} count={seller?.ratingCount || 0} size="sm" />
                    </div>
                  </div>
                  <Link href={`/profile/${seller?._id}`} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View Profile</Link>
                </div>
              </div>

              {/* Buyer: Save + Watch */}
              {!isOwner && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave}
                    className="btn btn-sm"
                    style={{ flex: 1, background: isSaved ? 'var(--accent)' : '#fff', color: isSaved ? '#fff' : 'var(--text-primary)', border: '1.5px solid', borderColor: isSaved ? 'var(--accent)' : 'var(--border)', fontWeight: 600 }}
                  >
                    {isSaved ? '❤️ Saved' : '🤍 Save'}
                  </button>
                  <button onClick={handleWatch} className={`watch-btn ${isWatching ? 'watching' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                    🔔 {isWatching ? 'Watching' : 'Watch Price'}
                  </button>
                </div>
              )}

              {/* BUYER: Make an Offer */}
              {!isOwner && listing.status === 'active' && (
                <div className="card" style={{ border: myOffer?.status === 'accepted' ? '2px solid var(--success)' : myOffer?.status === 'countered' ? '2px solid var(--warning)' : '1.5px solid var(--border)' }}>
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      🤝 Make an Offer
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Listed at ₹{listing.price?.toLocaleString('en-IN')}</span>
                    </h4>
                    {!myOffer && (
                      <>
                        {/* Buy at listed price */}
                        <button
                          onClick={handleBuyNow}
                          disabled={offerSubmitting}
                          className="btn btn-primary"
                          style={{ width: '100%', marginBottom: 10 }}
                        >
                          🛒 Accept Listed Price — ₹{listing.price?.toLocaleString('en-IN')}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or negotiate</span>
                          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>
                        <form onSubmit={handleMakeOffer}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                              <input type="number" className="form-input" style={{ paddingLeft: 28 }} placeholder="Your offer price" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} min={1} required />
                            </div>
                            <button type="submit" className="btn btn-secondary btn-sm" disabled={offerSubmitting || !offerAmount}>{offerSubmitting ? '...' : 'Make Offer'}</button>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Seller will be notified — they can accept, decline, or counter.</div>
                        </form>
                      </>
                    )}
                    {myOffer?.status === 'pending' && (
                      <div>
                        <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Your offer</div>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>₹{myOffer.amount.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>⏳ Waiting for seller response</div>
                        </div>
                        <button onClick={() => setMyOffer(null)} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>Withdraw &amp; re-offer</button>
                      </div>
                    )}
                    {myOffer?.status === 'accepted' && (
                      <div>
                        <div style={{ background: '#dcfce7', borderRadius: 8, padding: '14px', textAlign: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🎉</div>
                          <div style={{ fontWeight: 700, color: '#15803d' }}>Deal at ₹{myOffer.amount.toLocaleString('en-IN')}!</div>
                          <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: 4 }}>Contact details unlocked below.</div>
                        </div>
                        {/* Contact card */}
                        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '14px', marginBottom: 10 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📞 Seller Contact</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{myOffer.sellerId?.name || listing.sellerId?.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>📧 {myOffer.sellerId?.email}</div>
                          {myOffer.sellerId?.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>📱 {myOffer.sellerId.phone}</div>}
                        </div>
                        {/* Buyer review trigger */}
                        {!showBuyerReview ? (
                          <button onClick={() => setShowBuyerReview(true)} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 4 }}>⭐ Leave a review for the seller</button>
                        ) : (
                          <form onSubmit={handleBuyerReview} style={{ marginTop: 8 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Rate your experience</div>
                            <StarRating rating={buyerReviewRating} interactive onRate={setBuyerReviewRating} size="lg" />
                            <textarea className="form-input form-textarea" style={{ marginTop: 8, minHeight: 60 }} placeholder="How was the transaction? (optional)" value={buyerReviewComment} onChange={e => setBuyerReviewComment(e.target.value)} />
                            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={!buyerReviewRating}>Submit Review</button>
                              <button type="button" onClick={() => setShowBuyerReview(false)} className="btn btn-ghost btn-sm">Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                    {myOffer?.status === 'declined' && (
                      <div>
                        <div style={{ background: '#fee2e2', borderRadius: 8, padding: '12px', marginBottom: 10, textAlign: 'center' }}>
                          <div style={{ color: '#b91c1c', fontWeight: 600 }}>❌ Offer declined</div>
                          <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: 2 }}>The listing is still active — make a new offer below.</div>
                        </div>
                        <form onSubmit={handleMakeOffer}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                              <input type="number" className="form-input" style={{ paddingLeft: 28 }} placeholder="New offer" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} min={1} required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={offerSubmitting}>Send</button>
                          </div>
                        </form>
                      </div>
                    )}
                    {myOffer?.status === 'countered' && (
                      <div>
                        <div style={{ background: '#fef9c3', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                          <div style={{ fontSize: '0.78rem', color: '#92400e', marginBottom: 2 }}>Your offer: <s>₹{myOffer.amount.toLocaleString('en-IN')}</s></div>
                          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#78350f' }}>Seller counter: ₹{myOffer.counterAmount?.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: 4 }}>Do you accept?</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleOfferAction(myOffer._id, 'accept-counter')} className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={offerSubmitting}>✅ Accept ₹{myOffer.counterAmount?.toLocaleString('en-IN')}</button>
                          <button onClick={() => handleOfferAction(myOffer._id, 'decline-counter')} className="btn btn-sm" style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }} disabled={offerSubmitting}>❌ Decline</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="card">
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Manage</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Link href={`/listings/${id}/edit`} className="btn btn-secondary">✏️ Edit Listing</Link>
                      {listing.status === 'active' && (
                        <ConfirmAction
                          onConfirm={handleMarkSold}
                          className="btn"
                          style={{ background: '#1e293b', color: '#f8fafc', border: '1.5px solid #334155' }}
                        >
                          ✅ Mark as Sold
                        </ConfirmAction>
                      )}
                      <ConfirmAction onConfirm={handleDelete} className="btn btn-danger">
                        🗑️ Delete Listing
                      </ConfirmAction>
                    </div>
                  </div>
                </div>
              )}

              {/* Review after sold */}
              {isOwner && showReview && (
                <div className="card" style={{ border: '2px solid var(--accent)' }}>
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Rate the transaction</h4>
                    <form onSubmit={handleReview}>
                      <StarRating rating={reviewRating} interactive onRate={setReviewRating} size="lg" />
                      <textarea className="form-input form-textarea" style={{ marginTop: 12, minHeight: 60 }} placeholder="Leave a comment (optional)" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                      <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} disabled={!reviewRating}>Submit Review</button>
                    </form>
                  </div>
                </div>
              )}

              {/* SELLER: Incoming Offers */}
              {isOwner && sellerOffers.length > 0 && (
                <div className="card" style={{ border: '1.5px solid var(--accent)' }}>
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>
                      💰 Offers Received ({sellerOffers.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sellerOffers.map(offer => (
                        <div key={offer._id} style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div className="avatar avatar-sm">{offer.buyerId?.name?.[0]}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{offer.buyerId?.name}</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: offer.status === 'accepted' ? 'var(--success)' : 'var(--text-primary)' }}>
                                ₹{offer.amount.toLocaleString('en-IN')}
                                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                                  ({Math.round((1 - offer.amount / listing.price) * 100)}% off ask)
                                </span>
                              </div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                              {offer.status === 'pending'   && <span className="badge badge-warning">Pending</span>}
                              {offer.status === 'accepted'  && <span className="badge badge-success">Accepted</span>}
                              {offer.status === 'declined'  && <span className="badge badge-danger">Declined</span>}
                              {offer.status === 'countered' && <span className="badge badge-info">Countered</span>}
                            </div>
                          </div>

                          {offer.status === 'pending' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleOfferAction(offer._id, 'accept')} className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={offerSubmitting}>✅ Accept</button>
                                <button onClick={() => handleOfferAction(offer._id, 'decline')} className="btn btn-sm" style={{ flex: 1, background: '#fee2e2', color: '#b91c1c', border: 'none' }} disabled={offerSubmitting}>❌ Decline</button>
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>₹</span>
                                  <input
                                    type="number" className="form-input btn-sm" style={{ paddingLeft: 24, fontSize: '0.85rem' }}
                                    placeholder="Counter price" min={1}
                                    value={counterInput} onChange={e => setCounterInput(e.target.value)}
                                  />
                                </div>
                                <button onClick={() => { if (counterInput) handleOfferAction(offer._id, 'counter', counterInput) }} className="btn btn-secondary btn-sm" disabled={offerSubmitting || !counterInput}>
                                  ↩️ Counter
                                </button>
                              </div>
                            </div>
                          )}

                          {offer.status === 'countered' && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              You countered ₹{offer.counterAmount?.toLocaleString('en-IN')} — waiting for buyer.
                            </div>
                          )}

                          {offer.status === 'accepted' && (
                            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '12px', marginTop: 6 }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', marginBottom: 6, textTransform: 'uppercase' }}>📞 Buyer Contact</div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{offer.buyerId?.name}</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>📧 {offer.buyerId?.email}</div>
                              {offer.buyerId?.phone && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>📱 {offer.buyerId.phone}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SELLER: Buyer message threads */}
              {isOwner && threads.length > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>
                      💬 Buyer Inquiries ({threads.length})
                    </h4>
                    {threads.length > 1 && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                        {threads.map((t) => (
                          <button key={t._id} onClick={() => setActiveThread(t)}
                            className={`btn btn-sm ${activeThread?._id === t._id ? 'btn-primary' : 'btn-ghost'}`}>
                            {t.buyerId?.name?.split(' ')[0] || 'Buyer'}
                          </button>
                        ))}
                      </div>
                    )}
                    {activeThread && (
                      <>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                          from <strong>{activeThread.buyerId?.name}</strong>
                        </div>
                        <MessageThread t={activeThread} myId={currentUser?._id} />
                        <form onSubmit={(e) => handleReply(e, activeThread._id)} style={{ display: 'flex', gap: 8 }}>
                          <input className="form-input" style={{ flex: 1 }} placeholder="Reply to buyer..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} required />
                          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>Send</button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* BUYER: inquiry thread */}
              {!isOwner && listing.status === 'active' && (
                <div className="card">
                  <div className="card-body">
                    <h4 style={{ fontWeight: 700, marginBottom: 12 }}>
                      {thread ? 'Your Conversation' : 'Message Seller'}
                    </h4>
                    {thread ? (
                      <>
                        <MessageThread t={thread} myId={currentUser?._id} />
                        <form onSubmit={(e) => handleReply(e, thread._id)} style={{ display: 'flex', gap: 8 }}>
                          <input className="form-input" style={{ flex: 1 }} placeholder="Reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} required />
                          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>Send</button>
                        </form>
                      </>
                    ) : (
                      <form onSubmit={handleInquiry}>
                        <textarea className="form-input form-textarea" style={{ minHeight: 80, marginBottom: 10 }}
                          placeholder="Hi, is this still available? I'm interested..."
                          value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)} required />
                        <button type="submit" id="send-inquiry-btn" className="btn btn-primary" style={{ width: '100%' }}
                          disabled={submitting || !currentUser}>
                          {currentUser ? (submitting ? 'Sending...' : 'Send Message') : 'Login to message seller'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}
    </>
  )
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></>}>
      <ListingDetail />
    </Suspense>
  )
}
