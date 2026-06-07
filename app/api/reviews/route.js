import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Review from '@/models/Review'
import Offer from '@/models/Offer'
import Listing from '@/models/Listing'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth'

export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sellerId, listingId, rating, comment, role } = await req.json()
    if (!sellerId || !listingId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // ── GATE: buyer must have an accepted offer (or buy-now) for this listing ──
    if (role === 'buyer') {
      const listing = await Listing.findById(listingId)
      const isBuyer = listing?.boughtBy?.toString() === user._id.toString()
      if (!isBuyer) {
        // Fallback: check accepted offer
        const acceptedOffer = await Offer.findOne({ listingId, buyerId: user._id, status: 'accepted' })
        if (!acceptedOffer) return NextResponse.json({ error: 'You can only review after completing a purchase' }, { status: 403 })
      }
    }

    const existing = await Review.findOne({ reviewerId: user._id, listingId })
    if (existing) return NextResponse.json({ error: 'Already reviewed this listing' }, { status: 409 })

    const review = await Review.create({ reviewerId: user._id, sellerId, listingId, rating, comment })

    // Recalculate seller avg rating
    const allReviews = await Review.find({ sellerId })
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await User.findByIdAndUpdate(sellerId, { avgRating: Math.round(avg * 10) / 10, ratingCount: allReviews.length })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    console.error('Review POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
