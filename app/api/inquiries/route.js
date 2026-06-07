import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Inquiry from '@/models/Inquiry'
import Listing from '@/models/Listing'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'

export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listingId, message, threadId } = await req.json()
    if (!listingId || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const listing = await Listing.findById(listingId)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const isSeller = listing.sellerId.toString() === user._id.toString()

    // If threadId provided (seller replying to a specific buyer thread)
    if (threadId) {
      const inquiry = await Inquiry.findById(threadId)
      if (!inquiry) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
      inquiry.messages.push({ sender: user._id, text: message })
      await inquiry.save()
      const populated = await Inquiry.findById(inquiry._id)
        .populate('buyerId', 'name avatar')
        .populate('sellerId', 'name avatar')
        .populate('messages.sender', 'name avatar')
      return NextResponse.json({ inquiry: populated })
    }

    // Buyer sending first message or reply (find by buyerId)
    if (isSeller) {
      return NextResponse.json({ error: 'Use threadId to reply as seller' }, { status: 400 })
    }

    let inquiry = await Inquiry.findOne({ listingId, buyerId: user._id })
    if (inquiry) {
      inquiry.messages.push({ sender: user._id, text: message })
      await inquiry.save()
    } else {
      inquiry = await Inquiry.create({
        listingId, buyerId: user._id, sellerId: listing.sellerId,
        messages: [{ sender: user._id, text: message }]
      })
      // Notify seller of new inquiry
      await Notification.create({
        userId: listing.sellerId,
        type: 'inquiry',
        message: `New message from a buyer on your listing "${listing.title}"`,
        listingId,
        read: false
      })
    }

    const populated = await Inquiry.findById(inquiry._id)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('messages.sender', 'name avatar')

    return NextResponse.json({ inquiry: populated }, { status: 201 })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    const query = { $or: [{ buyerId: user._id }, { sellerId: user._id }] }
    if (listingId) query.listingId = listingId

    const inquiries = await Inquiry.find(query)
      .populate('listingId', 'title images price status')
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('messages.sender', 'name avatar')
      .sort({ updatedAt: -1 })

    return NextResponse.json({ inquiries })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
