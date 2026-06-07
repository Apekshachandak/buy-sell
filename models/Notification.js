import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['iso_match', 'price_drop', 'inquiry', 'offer', 'general'], required: true },
  message:   { type: String, required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  read:      { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
