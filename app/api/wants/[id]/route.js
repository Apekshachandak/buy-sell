import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Want from '@/models/Want'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const want = await Want.findById(id)
    if (!want) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (want.buyerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await Want.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
