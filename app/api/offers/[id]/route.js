import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Offer from '@/models/Offer'
import Listing from '@/models/Listing'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'

// PATCH /api/offers/[id] — accept | decline | counter (seller) or buyer accept/decline counter
export async function PATCH(req, { params }) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const offer = await Offer.findById(id).populate('buyerId', 'name email phone').populate('listingId')
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const { action, counterAmount } = await req.json()
    const isSeller = offer.sellerId.toString() === user._id.toString()
    const isBuyer  = offer.buyerId._id.toString() === user._id.toString()

    // ─── SELLER ACTIONS ───────────────────────────────────────────
    if (isSeller) {
      if (action === 'accept') {
        offer.status = 'accepted'
        await offer.save()
        // Mark listing as bought by this buyer
        await Listing.findByIdAndUpdate(offer.listingId._id, { boughtBy: offer.buyerId._id })
        await Notification.create({
          userId: offer.buyerId._id,
          type: 'offer',
          message: `🎉 Your offer of ₹${offer.amount.toLocaleString('en-IN')} on "${offer.listingId.title}" was accepted!`,
          listingId: offer.listingId._id,
          read: false,
        })
      } else if (action === 'decline') {
        offer.status = 'declined'
        await offer.save()
        await Notification.create({
          userId: offer.buyerId._id,
          type: 'offer',
          message: `Your offer on "${offer.listingId.title}" was declined. The listing is still active.`,
          listingId: offer.listingId._id,
          read: false,
        })
      } else if (action === 'counter') {
        if (!counterAmount || counterAmount <= 0)
          return NextResponse.json({ error: 'Invalid counter amount' }, { status: 400 })
        offer.status = 'countered'
        offer.counterAmount = counterAmount
        await offer.save()
        await Notification.create({
          userId: offer.buyerId._id,
          type: 'offer',
          message: `Seller countered your offer on "${offer.listingId.title}" — they want ₹${Number(counterAmount).toLocaleString('en-IN')}`,
          listingId: offer.listingId._id,
          read: false,
        })
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    }
    // ─── BUYER ACTIONS ────────────────────────────────────────────
    else if (isBuyer) {
      if (offer.status !== 'countered')
        return NextResponse.json({ error: 'No counter to respond to' }, { status: 400 })
      if (action === 'accept-counter') {
        offer.amount = offer.counterAmount
        offer.status = 'accepted'
        await offer.save()
        // Mark listing as bought
        await Listing.findByIdAndUpdate(offer.listingId._id, { boughtBy: offer.buyerId._id })
        await Notification.create({
          userId: offer.sellerId,
          type: 'offer',
          message: `${offer.buyerId.name} accepted your counter offer of ₹${offer.counterAmount.toLocaleString('en-IN')} on "${offer.listingId.title}"`,
          listingId: offer.listingId._id,
          read: false,
        })
      } else if (action === 'decline-counter') {
        offer.status = 'declined'
        await offer.save()
        await Notification.create({
          userId: offer.sellerId,
          type: 'offer',
          message: `${offer.buyerId.name} declined your counter offer on "${offer.listingId.title}"`,
          listingId: offer.listingId._id,
          read: false,
        })
      } else {
        return NextResponse.json({ error: 'Invalid buyer action' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await Offer.findById(offer._id)
      .populate('buyerId', 'name avatar email phone')
      .populate('sellerId', 'name avatar email phone')
    return NextResponse.json({ offer: updated })
  } catch (err) {
    console.error('Offer PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
