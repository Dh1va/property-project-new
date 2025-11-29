// server/models/Seller.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String },
  phone: { type: String, default: "" },    // phone
  city: { type: String, default: "" },     // city
  pincode: { type: String, default: "" },  // pincode
  isActive: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

sellerSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("Seller", sellerSchema);
