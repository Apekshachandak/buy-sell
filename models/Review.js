import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true })

ReviewSchema.index({ reviewerId: 1, listingId: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)
