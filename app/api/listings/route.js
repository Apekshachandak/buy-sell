import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Listing from '@/models/Listing'
import Want from '@/models/Want'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

async function matchWants(newListing) {
  try {
    const titleWords = newListing.title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const openWants = await Want.find({
      status: 'open',
      $or: [{ category: newListing.category }, { category: 'any' }]
    })
    for (const want of openWants) {
      if (want.buyerId.toString() === newListing.sellerId.toString()) continue
      const wantWords = want.title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      const overlap = titleWords.filter(w => wantWords.includes(w))
      const priceOk = !want.maxPrice || newListing.price <= want.maxPrice
      if (overlap.length >= 1 && priceOk) {
        await Notification.create({
          userId: want.buyerId,
          type: 'iso_match',
          message: `A listing matching your want "${want.title}" was posted: "${newListing.title}" for ₹${newListing.price.toLocaleString('en-IN')}`,
          listingId: newListing._id,
          read: false
        })
      }
    }
  } catch (err) {
    console.error('ISO match error:', err)
  }
}

export async function GET(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = 12

    const query = { status: 'active' }
    if (search) query.$text = { $search: search }
    if (category) query.category = category
    if (minPrice !== null || maxPrice !== null) {
      query.price = {}
      if (minPrice !== null) query.price.$gte = minPrice
      if (maxPrice !== null) query.price.$lte = maxPrice
    }

    const total = await Listing.countDocuments(query)
    const listings = await Listing.find(query)
      .populate('sellerId', 'name avatar avgRating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({ listings, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Get listings error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const title = formData.get('title')
    const description = formData.get('description')
    const price = Number(formData.get('price'))
    const category = formData.get('category')
    const condition = formData.get('condition')
    const location = formData.get('location') || ''
    const templateData = formData.get('templateData') ? JSON.parse(formData.get('templateData')) : {}
    const imageFiles = formData.getAll('images')

    if (!title || !description || !price || !category || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const imageUrls = []
    for (const file of imageFiles.slice(0, 3)) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const url = await uploadImage(buffer)
        imageUrls.push(url)
      }
    }

    const listing = await Listing.create({
      sellerId: user._id,
      title, description, price, category, condition, location,
      images: imageUrls,
      templateData
    })

    // Run ISO matching in background
    matchWants(listing)

    return NextResponse.json({ listing }, { status: 201 })
  } catch (err) {
    console.error('Create listing error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
