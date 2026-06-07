import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(req, { params }) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await Notification.findOneAndUpdate({ _id: id, userId: user._id }, { read: true })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Mark all as read
    if ((await params).id === 'all') {
      await Notification.updateMany({ userId: user._id }, { read: true })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
