// server/routes/blogRoutes.js
import express from "express";
import {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

import upload from "../middleware/uploadCloudinary.js"; // your existing Cloudinary multer middleware
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", listBlogs);
router.get("/:id", getBlog);

// Admin protected (multipart form for images)
router.post("/", protect, adminOnly, upload.single("image"), createBlog);
router.put("/:id", protect, adminOnly, upload.single("image"), updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

export default router;
