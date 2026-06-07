import mongoose from 'mongoose'

const WantSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'furniture', 'books', 'vehicles', 'sports', 'appliances', 'music', 'toys & games', 'jewelry', 'art & collectibles', 'kitchen', 'stationery & office', 'baby & kids', 'other', 'any'],
    default: 'any'
  },
  maxPrice: { type: Number, default: null },
  status: { type: String, enum: ['open', 'fulfilled'], default: 'open' },
}, { timestamps: true })

export default mongoose.models.Want || mongoose.model('Want', WantSchema)
