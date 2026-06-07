import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Saved from '@/models/Saved'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const saved = await Saved.find({ userId: user._id })
      .populate({ path: 'listingId', populate: { path: 'sellerId', select: 'name avatar' } })
      .sort({ createdAt: -1 })
    return NextResponse.json({ saved })
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
    const existing = await Saved.findOne({ userId: user._id, listingId })
    if (existing) {
      await Saved.findByIdAndDelete(existing._id)
      return NextResponse.json({ saved: false })
    }
    await Saved.create({ userId: user._id, listingId })
    return NextResponse.json({ saved: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
