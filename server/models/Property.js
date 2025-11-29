// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Human-readable property id / ref
  refNumber: { type: String, unique: true, sparse: true },
  description: String,
  totalPrice: Number,
  squareMeters: Number,
  zip: String,
  place: String,
  city: String,
  country: String,
  rooms: Number,
  bathrooms: Number,
  pool: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  garden: { type: Boolean, default: false },
  type: String,
  amenities: [String],
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },

  // new: contact agent number for enquiries (string to allow +country codes)
  agentNumber: { type: String, default: "" },

  // Approval workflow
  status: {
    type: String,
    enum: ["pending", "active", "inactive", "rejected", "archived"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
  submittedAt: { type: Date, default: null },
  publishedAt: { type: Date, default: null },

  // soft-delete / audit
  ownerRemoved: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

// Generate a refNumber when the property is first created
propertySchema.pre("save", function (next) {
  if (this.isNew && !this.refNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000); // 6 digits
    this.refNumber = `PROP-${year}-${rand}`;
  }

  // ensure submittedAt set when creating as pending by seller
  if (this.isNew && this.status === "pending" && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  next();
});

export default mongoose.model("Property", propertySchema);
