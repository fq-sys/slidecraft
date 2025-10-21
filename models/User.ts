import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isPro: { type: Boolean, default: false },
  proExpires: { type: Date, default: null },
  role: { type: String, enum: ['user','admin'], default: 'user' },
})

const User = models.User || model('User', UserSchema)
export default User
