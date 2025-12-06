// server/controllers/blogController.js
import Blog from "../models/Blog.js";
import slugify from "slugify";

export const listBlogs = async (req, res) => {
  try {
    // optional ?limit and ?all query
    const { all, limit = 20 } = req.query;
    let q = {};
    if (!all) q.published = true;
    const posts = await Blog.find(q).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(posts);
  } catch (err) {
    console.error("listBlogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBlog = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    console.error("getBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, published } = req.body;
    const imageUrl = req.file?.path || req.body.imageUrl || undefined; // multer-cloudinary stores path
    const slug = title ? slugify(title, { lower: true, strict: true }) : `${Date.now()}`;

    const newPost = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      author: author || "Admin",
      imageUrl,
      published: published === "false" ? false : (published ?? true),
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("createBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, published } = req.body;
    const updates = {
      title,
      excerpt,
      content,
      author,
      published: published === "false" ? false : (published ?? undefined),
    };

    if (req.file?.path) updates.imageUrl = req.file.path;
    if (title) updates.slug = slugify(title, { lower: true, strict: true });

    const updated = await Blog.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("updateBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
