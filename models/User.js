import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '', maxlength: 300 },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },   // optional, revealed on accepted deal
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
