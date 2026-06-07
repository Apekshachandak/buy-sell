import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Watched from '@/models/Watched'
import Listing from '@/models/Listing'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const watched = await Watched.find({ userId: user._id })
      .populate({ path: 'listingId', populate: { path: 'sellerId', select: 'name avatar' } })
      .sort({ createdAt: -1 })
    return NextResponse.json({ watched })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { listingId } = await req.json()
    const listing = await Listing.findById(listingId)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const existing = await Watched.findOne({ userId: user._id, listingId })
    if (existing) {
      await Watched.findByIdAndDelete(existing._id)
      return NextResponse.json({ watching: false })
    }
    await Watched.create({ userId: user._id, listingId, priceAtWatch: listing.price })
    return NextResponse.json({ watching: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
