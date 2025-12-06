// server/models/Blog.js
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, index: true },
  excerpt: { type: String, trim: true },
  content: { type: String }, // HTML/markdown
  imageUrl: { type: String },
  author: { type: String, default: "Admin" },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Blog", BlogSchema);
