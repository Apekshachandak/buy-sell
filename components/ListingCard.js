'use client'
import Link from 'next/link'
import { useState } from 'react'

const CATEGORY_ICONS = {
  electronics: '💻', clothing: '👗', furniture: '🛋️',
  books: '📚', vehicles: '🚗', sports: '⚽',
  appliances: '🏠', music: '🎸', 'toys & games': '🎮',
  jewelry: '💍', 'art & collectibles': '🖼️', kitchen: '🍳',
  'stationery & office': '🖊️', 'baby & kids': '🧸', other: '📦'
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function ListingCard({ listing, onSaveToggle, isSaved = false, currentUserId = null }) {
  const [saved, setSaved] = useState(isSaved)
  const [saving, setSaving] = useState(false)

  // Don't show save on seller's own listing
  const isOwner = currentUserId && currentUserId === (listing.sellerId?._id?.toString() || listing.sellerId?.toString())

  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    setSaving(true)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing._id })
      })
      if (res.status === 401) { window.location.href = '/auth/login'; return }
      const data = await res.json()
      setSaved(data.saved)
      if (onSaveToggle) onSaveToggle(listing._id, data.saved)
    } catch {}
    setSaving(false)
  }

  const img = listing.images?.[0]
  const isSold = listing.status === 'sold'

  return (
    <Link href={`/listings/${listing._id}`} style={{ display: 'block' }}>
      <div className="listing-card">
        {img
          ? <img src={img} alt={listing.title} className="listing-card-img" />
          : <div className="listing-card-img-placeholder">{CATEGORY_ICONS[listing.category] || '📦'}</div>
        }
        {isSold && (
          <div className="listing-card-badge-sold">
            <span>SOLD</span>
          </div>
        )}
        {/* Only show heart if not owner and not sold */}
        {!isOwner && !isSold && (
          <button
            className={`listing-card-heart ${saved ? 'is-saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            {saved ? '❤️' : <span style={{ color: '#374151', fontSize: '1rem', lineHeight: 1 }}>♡</span>}
          </button>
        )}
        <div className="listing-card-body">
          <div className="listing-card-category">{listing.category}</div>
          <div className="listing-card-title">{listing.title}</div>
          <div className="listing-card-price">₹{listing.price?.toLocaleString('en-IN')}</div>
          <div className="listing-card-meta">
            {listing.location && <span>📍 {listing.location}</span>}
            <span>· {timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
