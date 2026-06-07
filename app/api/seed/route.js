import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Listing from '@/models/Listing'
import bcrypt from 'bcryptjs'

const SEED_USERS = [
  { name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', bio: 'Decluttering my life one item at a time 🌿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
  { name: 'Rohan Mehta', email: 'rohan@demo.com', password: 'demo123', bio: 'Tech enthusiast, selling gadgets I no longer use', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan' },
  { name: 'Ananya Iyer', email: 'ananya@demo.com', password: 'demo123', bio: 'Fashion lover | Sustainable shopping advocate', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ananya' },
]

const SEED_LISTINGS = [
  { title: 'Sony WH-1000XM4 Wireless Headphones', description: 'Brand: Sony\nModel: WH-1000XM4\nAge: 1.5 years\nCondition details: Excellent, no scratches\nIncludes: Original box, charging cable, carry case\nReason for selling: Upgrading to XM5', price: 14500, category: 'electronics', condition: 'like-new', location: 'Bangalore', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'] },
  { title: 'Apple MacBook Air M1 2020', description: 'Brand: Apple\nModel: MacBook Air M1\nAge: 3 years\nCondition details: Minor wear on palm rest, works perfectly\nIncludes: Original charger\nReason for selling: Got a Pro', price: 55000, category: 'electronics', condition: 'good', location: 'Mumbai', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'] },
  { title: 'Zara Linen Blazer – Size M', description: 'Brand: Zara\nSize: M\nColor: Beige\nCondition details: Worn twice, no stains or damage\nTimes worn: 2', price: 1800, category: 'clothing', condition: 'like-new', location: 'Delhi', images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b8a39?w=600'] },
  { title: 'IKEA KALLAX 4x2 Shelf Unit', description: 'Item type: Shelving unit\nDimensions: 147cm x 77cm x 39cm\nMaterial: Particle board\nColor: White\nAge: 2 years\nAssembly required: Yes (tools included)', price: 3500, category: 'furniture', condition: 'good', location: 'Pune', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'] },
  { title: 'Atomic Habits by James Clear', description: 'Title: Atomic Habits\nAuthor: James Clear\nEdition: 1st edition, 2018\nCondition details: No highlights, light shelf wear on spine', price: 220, category: 'books', condition: 'good', location: 'Hyderabad', images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'] },
  { title: 'Canon EOS 200D DSLR Camera', description: 'Brand: Canon\nModel: EOS 200D\nAge: 4 years\nCondition details: Fully functional, minor cosmetic wear\nIncludes: 18-55mm kit lens, charger, 32GB SD card, bag\nReason for selling: Moving to mirrorless', price: 28000, category: 'electronics', condition: 'good', location: 'Chennai', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'] },
  { title: 'Adidas Ultraboost 22 Running Shoes – Size 9', description: 'Brand: Adidas\nSize: UK 9 / EU 43\nColor: Core Black\nCondition details: Worn ~15 times, soles still excellent\nTimes worn: 15', price: 4500, category: 'sports', condition: 'good', location: 'Bangalore', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'] },
  { title: 'Honda Activa 6G Scooter 2021', description: 'Make: Honda\nModel: Activa 6G\nYear: 2021\nKMs driven: 18,000 km\nFuel type: Petrol\nCondition details: Single owner, serviced at Honda service centre, no accidents', price: 58000, category: 'vehicles', condition: 'good', location: 'Mumbai', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'] },
  { title: 'Samsung 55" 4K Smart TV', description: 'Brand: Samsung\nModel: Crystal 4K UHD\nAge: 2 years\nCondition details: No dead pixels, remote included\nIncludes: Remote, power cable, wall mount bracket\nReason for selling: Upgrading to OLED', price: 32000, category: 'electronics', condition: 'like-new', location: 'Delhi', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600'] },
  { title: 'Levi\'s 511 Slim Jeans – 32x32', description: 'Brand: Levi\'s\nSize: 32 waist x 32 length\nColor: Dark indigo\nCondition details: Minor fade on knees, no tears\nTimes worn: 20+', price: 900, category: 'clothing', condition: 'fair', location: 'Ahmedabad', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'] },
]

export async function GET() {
  try {
    await connectDB()

    // Clear existing seed data
    await User.deleteMany({ email: { $in: SEED_USERS.map(u => u.email) } })

    const createdUsers = []
    for (const u of SEED_USERS) {
      const passwordHash = await bcrypt.hash(u.password, 10)
      const user = await User.create({ name: u.name, email: u.email, passwordHash, bio: u.bio, avatar: u.avatar })
      createdUsers.push(user)
    }

    // Delete old seed listings
    await Listing.deleteMany({ location: { $in: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'] } })

    for (let i = 0; i < SEED_LISTINGS.length; i++) {
      const seller = createdUsers[i % createdUsers.length]
      await Listing.create({ ...SEED_LISTINGS[i], sellerId: seller._id, viewCount: Math.floor(Math.random() * 80) + 5 })
    }

    return NextResponse.json({ message: `Seeded ${createdUsers.length} users and ${SEED_LISTINGS.length} listings` })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
