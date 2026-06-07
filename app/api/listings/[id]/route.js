import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Listing from '@/models/Listing'
import Watched from '@/models/Watched'
import Notification from '@/models/Notification'
import { getAuthUser } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

async function triggerPriceDropAlerts(listingId, oldPrice, newPrice, listingTitle) {
  if (newPrice >= oldPrice) return
  try {
    const watchers = await Watched.find({ listingId })
    for (const watch of watchers) {
      await Notification.create({
        userId: watch.userId,
        type: 'price_drop',
        message: `Price dropped on "${listingTitle}" — was ₹${oldPrice.toLocaleString('en-IN')}, now ₹${newPrice.toLocaleString('en-IN')}`,
        listingId,
        read: false
      })
    }
  } catch (err) {
    console.error('Price drop alert error:', err)
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB()
    const { id } = await params
    const listing = await Listing.findById(id).populate('sellerId', 'name avatar avgRating ratingCount createdAt')
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const user = await getAuthUser()
    const isOwner = user && user._id.toString() === listing.sellerId._id.toString()

    // Increment view count (skip for owner)
    if (!isOwner) {
      await Listing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
    }

    return NextResponse.json({ listing })
  } catch (err) {
    console.error('Get listing error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
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

    const formData = await req.formData()
    const title = formData.get('title') || listing.title
    const description = formData.get('description') || listing.description
    const newPrice = Number(formData.get('price')) || listing.price
    const category = formData.get('category') || listing.category
    const condition = formData.get('condition') || listing.condition
    const location = formData.get('location') ?? listing.location
    const templateData = formData.get('templateData') ? JSON.parse(formData.get('templateData')) : listing.templateData
    const imageFiles = formData.getAll('images')

    let images = listing.images
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      images = []
      for (const file of imageFiles.slice(0, 3)) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer()
          const url = await uploadImage(Buffer.from(bytes))
          images.push(url)
        }
      }
    }

    const oldPrice = listing.price
    const updated = await Listing.findByIdAndUpdate(id, {
      title, description, price: newPrice, category, condition, location, templateData, images
    }, { new: true })

    // Trigger price drop alerts
    triggerPriceDropAlerts(id, oldPrice, newPrice, title)

    return NextResponse.json({ listing: updated })
  } catch (err) {
    console.error('Update listing error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
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

    await Listing.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    console.error('Delete listing error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
