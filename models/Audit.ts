import mongoose, { Schema, model, models } from "mongoose"

const AuditSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: String,
  ip: String,
  userAgent: String,
}, { timestamps: true })

export default models.Audit || model("Audit", AuditSchema)
