import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Listing from '@/models/Listing'
import Review from '@/models/Review'
import { getAuthUser } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    await connectDB()
    const { id } = await params
    const user = await User.findById(id).select('-passwordHash')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const listings = await Listing.find({ sellerId: id, status: 'active' }).sort({ createdAt: -1 })
    const reviews = await Review.find({ sellerId: id })
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 })
    return NextResponse.json({ user, listings, reviews })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB()
    const currentUser = await getAuthUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    if (currentUser._id.toString() !== id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { name, bio, avatar } = await req.json()
    const updated = await User.findByIdAndUpdate(id, { name, bio, avatar }, { new: true }).select('-passwordHash')
    return NextResponse.json({ user: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
