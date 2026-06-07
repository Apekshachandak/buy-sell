import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['iso_match', 'price_drop', 'inquiry', 'offer', 'general'], required: true },
  message: { type: String, required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true })

// Delete cached model so schema enum changes take effect on hot-reload
delete mongoose.models['Notification']

export default mongoose.model('Notification', NotificationSchema)
