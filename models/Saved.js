import mongoose from 'mongoose'

const SavedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
}, { timestamps: true })

SavedSchema.index({ userId: 1, listingId: 1 }, { unique: true })

export default mongoose.models.Saved || mongoose.model('Saved', SavedSchema)
