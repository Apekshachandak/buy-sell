'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/ListingCard'
import StarRating from '@/components/StarRating'

export default function ProfilePage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/profile/${id}`).then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Loading...</div></>
  if (!data?.user) return <><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>User not found</div></>

  const { user, listings, reviews } = data

  return (
    <>
      <Navbar />
      <div className="profile-header">
        <div className="container">
          <div className="profile-info">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="avatar avatar-xl" />
              : <div className="avatar avatar-xl">{user.name?.[0]}</div>
            }
            <div>
              <div className="profile-name">{user.name}</div>
              {user.bio && <div className="profile-bio">{user.bio}</div>}
              <div className="profile-meta">
                <StarRating rating={user.avgRating || 0} count={user.ratingCount || 0} />
                <span>📅 Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="page">
        <div className="container">
          <h2 className="section-title">Active Listings ({listings?.length || 0})</h2>
          {listings?.length > 0 ? (
            <div className="listing-grid" style={{ marginBottom: 48 }}>
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          ) : (
            <div className="empty-state" style={{ marginBottom: 48 }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No active listings</div>
            </div>
          )}

          <h2 className="section-title">Reviews ({reviews?.length || 0})</h2>
          {reviews?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(r => (
                <div key={r._id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {r.reviewerId?.avatar
                        ? <img src={r.reviewerId.avatar} alt="" className="avatar avatar-sm" />
                        : <div className="avatar avatar-sm">{r.reviewerId?.name?.[0]}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewerId?.name}</div>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                    </div>
                    {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-title">No reviews yet</div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
