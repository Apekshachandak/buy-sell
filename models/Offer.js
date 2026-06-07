import mongoose from 'mongoose'

const OfferSchema = new mongoose.Schema({
  listingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:        { type: Number, required: true },
  status:        { type: String, enum: ['pending', 'accepted', 'declined', 'countered'], default: 'pending' },
  counterAmount: { type: Number, default: null },
}, { timestamps: true })

// One active offer per buyer per listing
OfferSchema.index({ listingId: 1, buyerId: 1 }, { unique: true })

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema)
