import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const notifications = await Notification.find({ userId: user._id })
      .populate('listingId', 'title images')
      .sort({ createdAt: -1 })
      .limit(30)
    const unreadCount = notifications.filter(n => !n.read).length
    return NextResponse.json({ notifications, unreadCount })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
