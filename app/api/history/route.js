import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Offer from '@/models/Offer'
import Listing from '@/models/Listing'
import { getAuthUser } from '@/lib/auth'

// GET /api/history — returns buyer history and seller history for current user
export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Buyer history: accepted offers (negotiated or buy-now)
    const buyerOffers = await Offer.find({ buyerId: user._id, status: 'accepted' })
      .populate({
        path: 'listingId',
        select: 'title price images status sellerId',
        populate: { path: 'sellerId', select: 'name avatar' }
      })
      .sort({ updatedAt: -1 })

    // Seller history: listings marked as sold
    const soldListings = await Listing.find({ sellerId: user._id, status: 'sold' })
      .populate('boughtBy', 'name avatar')
      .sort({ updatedAt: -1 })

    // Enrich seller listings with the final accepted offer amount (if negotiated)
    const soldWithOffer = await Promise.all(soldListings.map(async (listing) => {
      const acceptedOffer = await Offer.findOne({ listingId: listing._id, status: 'accepted' })
        .populate('buyerId', 'name avatar')
      return { listing, acceptedOffer }
    }))

    return NextResponse.json({
      buyerHistory: buyerOffers.map(o => ({
        offerId: o._id,
        listing: o.listingId,
        paidAmount: o.amount,
        listedPrice: o.listingId?.price,
        savedAmount: o.listingId ? Math.max(0, o.listingId.price - o.amount) : 0,
        date: o.updatedAt,
      })),
      sellerHistory: soldWithOffer.map(({ listing, acceptedOffer }) => ({
        listingId: listing._id,
        title: listing.title,
        images: listing.images,
        listedPrice: listing.price,
        soldFor: acceptedOffer?.amount || listing.price,
        buyer: acceptedOffer?.buyerId || listing.boughtBy,
        date: listing.updatedAt,
      }))
    })
  } catch (err) {
    console.error('History error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
