import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Want from '@/models/Want'
import { getAuthUser } from '@/lib/auth'

export async function GET(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const query = { status: 'open' }
    if (category) query.category = category
    const wants = await Want.find(query)
      .populate('buyerId', 'name avatar createdAt')
      .sort({ createdAt: -1 })
    return NextResponse.json({ wants })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, category, maxPrice } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const want = await Want.create({
      buyerId: user._id, title, description, category: category || 'any',
      maxPrice: maxPrice || null
    })
    return NextResponse.json({ want }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
