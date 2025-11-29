// server/models/Enquiry.js
import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  refNumber: { type: String }, // enquiry reference
  // Link to the property document
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
  // Store the property's refNumber (e.g. PROP-2025-123456) if available
  propertyRef: { type: String },
  propertyTitle: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Enquiry", enquirySchema);
