import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Offer from '@/models/Offer'
import Listing from '@/models/Listing'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'

// POST /api/offers — buyer makes an offer OR buys at listed price
export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listingId, amount, buyNow } = await req.json()
    if (!listingId || (!amount && !buyNow))
      return NextResponse.json({ error: 'Invalid offer' }, { status: 400 })

    const listing = await Listing.findById(listingId).populate('sellerId', 'name email phone')
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    // Safe sellerId accessor — populated gives a User object, un-populated gives ObjectId
    const sellerId = listing.sellerId?._id ?? listing.sellerId
    if (!sellerId) return NextResponse.json({ error: 'Listing has no seller' }, { status: 400 })

    if (sellerId.toString() === user._id.toString())
      return NextResponse.json({ error: 'Cannot offer on your own listing' }, { status: 400 })

    const finalAmount = buyNow ? listing.price : Number(amount)
    const finalStatus = buyNow ? 'accepted' : 'pending'

    // Use $set so the unique index on {listingId, buyerId} is never violated on re-offers
    const offer = await Offer.findOneAndUpdate(
      { listingId, buyerId: user._id },
      {
        $set: {
          sellerId,
          amount: finalAmount,
          status: finalStatus,
          counterAmount: null,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Notify seller
    const sellerName = listing.sellerId?.name || 'Seller'
    try {
      if (buyNow) {
        await Listing.findByIdAndUpdate(listingId, { boughtBy: user._id })
        await Notification.create({
          userId: sellerId,
          type: 'offer',
          message: `${user.name} accepted your listed price of Rs.${listing.price.toLocaleString('en-IN')} on "${listing.title}"`,
          listingId,
          read: false,
        })
      } else {
        await Notification.create({
          userId: sellerId,
          type: 'offer',
          message: `${user.name} offered Rs.${finalAmount.toLocaleString('en-IN')} on your listing "${listing.title}"`,
          listingId,
          read: false,
        })
      }
    } catch (notifErr) {
      // Notification failure should not break the offer
      console.error('Notification error (non-fatal):', notifErr)
    }

    const populated = await Offer.findById(offer._id)
      .populate('buyerId', 'name avatar email phone')
      .populate('sellerId', 'name avatar email phone')

    return NextResponse.json({ offer: populated }, { status: 201 })
  } catch (err) {
    console.error('Offer POST error:', err)
    return NextResponse.json({ error: 'Server error', detail: err.message }, { status: 500 })
  }
}

// GET /api/offers?listingId=xxx
export async function GET(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const listing = await Listing.findById(listingId)
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const sellerId = listing.sellerId?._id ?? listing.sellerId
    const isSeller = sellerId?.toString() === user._id.toString()

    if (isSeller) {
      const offers = await Offer.find({ listingId })
        .populate('buyerId', 'name avatar email phone')
        .sort({ createdAt: -1 })
      return NextResponse.json({ offers })
    } else {
      const offer = await Offer.findOne({ listingId, buyerId: user._id })
        .populate('sellerId', 'name avatar email phone')
        .populate('buyerId', 'name avatar email phone')
      return NextResponse.json({ offer: offer || null })
    }
  } catch (err) {
    console.error('Offer GET error:', err)
    return NextResponse.json({ error: 'Server error', detail: err.message }, { status: 500 })
  }
}
