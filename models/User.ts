import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "user" },
  isPro: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaEncryptedSecret: { type: String, default: "" },
  failedLoginCount: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLoginAt: { type: Date },
}, { timestamps: true })

export default models.User || model("User", UserSchema)
