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
    if (listing.sellerId._id.toString() === user._id.toString())
      return NextResponse.json({ error: 'Cannot offer on your own listing' }, { status: 400 })

    const finalAmount = buyNow ? listing.price : Number(amount)
    const finalStatus = buyNow ? 'accepted' : 'pending'

    const offer = await Offer.findOneAndUpdate(
      { listingId, buyerId: user._id },
      {
        listingId, buyerId: user._id, sellerId: listing.sellerId._id,
        amount: finalAmount, status: finalStatus, counterAmount: null
      },
      { upsert: true, new: true }
    )

    // If buy now, mark listing as bought and notify seller
    if (buyNow) {
      await Listing.findByIdAndUpdate(listingId, { boughtBy: user._id })
      await Notification.create({
        userId: listing.sellerId._id,
        type: 'offer',
        message: `🎉 ${user.name} accepted your listed price of ₹${listing.price.toLocaleString('en-IN')} on "${listing.title}"!`,
        listingId,
        read: false,
      })
    } else {
      await Notification.create({
        userId: listing.sellerId._id,
        type: 'offer',
        message: `${user.name} offered ₹${finalAmount.toLocaleString('en-IN')} on your listing "${listing.title}"`,
        listingId,
        read: false,
      })
    }

    const populated = await Offer.findById(offer._id)
      .populate('buyerId', 'name avatar email phone')
      .populate('sellerId', 'name avatar email phone')

    return NextResponse.json({ offer: populated }, { status: 201 })
  } catch (err) {
    console.error('Offer POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
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

    const isSeller = listing.sellerId.toString() === user._id.toString()

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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
