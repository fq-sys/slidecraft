import mongoose, { Schema, model, models } from "mongoose"

const SlideSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  audience: String,
  slides: Array,
}, { timestamps: true })

export default models.Slide || model("Slide", SlideSchema)
