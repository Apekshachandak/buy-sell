import mongoose from 'mongoose'

const WatchedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  priceAtWatch: { type: Number, required: true },
}, { timestamps: true })

WatchedSchema.index({ userId: 1, listingId: 1 }, { unique: true })

export default mongoose.models.Watched || mongoose.model('Watched', WatchedSchema)
