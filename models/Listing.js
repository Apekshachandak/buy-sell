import mongoose from 'mongoose'

const ListingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other']
  },
  images: [{ type: String }],
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  location: { type: String, default: '' },
  status: { type: String, enum: ['active', 'sold'], default: 'active' },
  templateData: { type: mongoose.Schema.Types.Mixed, default: {} },
  viewCount: { type: Number, default: 0 },
  boughtBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // set on accepted offer/buy-now
}, { timestamps: true })

ListingSchema.index({ title: 'text', description: 'text' })

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema)
