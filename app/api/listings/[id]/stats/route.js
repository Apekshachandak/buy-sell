import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Listing from '@/models/Listing'
import Saved from '@/models/Saved'
import Inquiry from '@/models/Inquiry'
import { getAuthUser } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const listing = await Listing.findById(id)
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (listing.sellerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const saves = await Saved.countDocuments({ listingId: id })
    const inquiries = await Inquiry.countDocuments({ listingId: id })

    return NextResponse.json({
      views: listing.viewCount,
      saves,
      inquiries
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
