// src/admin/BlogForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBlog, fetchBlog, updateBlog } from "../services/blogApi";

const BlogForm = ({ mode = "create" /* "create" or "edit" */ }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    if (mode === "edit" && id) {
      let mounted = true;
      (async () => {
        setLoading(true);
        try {
          const post = await fetchBlog(id);
          if (!mounted) return;
          setTitle(post.title || "");
          setExcerpt(post.excerpt || "");
          setContent(post.content || "");
          setAuthor(post.author || "Admin");
          setPublished(!!post.published);
          setPreview(post.imageUrl || "");
        } catch (err) {
          console.error("fetch blog", err);
          alert("Failed to load blog");
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => (mounted = false);
    }
  }, [mode, id]);

  useEffect(() => {
    if (!imageFile) {
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setImageFile(f);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("excerpt", excerpt);
      fd.append("content", content);
      fd.append("author", author);
      fd.append("published", published ? "true" : "false");
      if (imageFile) fd.append("image", imageFile);

      if (mode === "edit" && id) {
        await updateBlog(id, fd);
        alert("Updated");
        navigate("/admin/blogs");
      } else {
        await createBlog(fd);
        alert("Created");
        navigate("/admin/blogs");
      }
    } catch (err) {
      console.error("save blog", err);
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {mode === "edit" ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/blogs")}
            className="text-sm px-3 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50"
            type="button"
          >
            Back to posts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 bg-white rounded-xl shadow-sm text-gray-500">Loading…</div>
      ) : (
        <form onSubmit={submit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Short summary shown on listing (max ~200 chars)"
              maxLength={400}
            />
            <div className="mt-1 text-xs text-gray-400">A short summary shown on the blog list.</div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content (HTML or Markdown)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-4 min-h-[260px] font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Paste sanitized HTML or markdown here. For long content use an external editor and paste the HTML."
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div>Server will sanitize content on save — keep scripts out of content.</div>
              <div className="text-gray-400">Supports basic HTML tags</div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                placeholder="Author name"
              />
            </div>

            <div className="flex items-center gap-4 md:justify-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                </div>
                <div className="text-xs text-gray-400 mt-1">Unpublish to hide from public list</div>
              </div>
            </div>

            {/* Featured image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured image</label>

              {/* Upload area */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="image"
                  className="flex-1 cursor-pointer rounded-lg border border-dashed border-gray-200 p-3 text-center hover:border-indigo-300 transition"
                >
                  <input id="image" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <div className="text-sm text-gray-600">
                    {preview ? "Change image" : "Upload an image (jpg, png, webp)"}
                  </div>
                </label>

                {preview ? (
                  <div className="relative w-28 h-20 rounded overflow-hidden border">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-full p-1 shadow"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-20 rounded bg-gray-50 border flex items-center justify-center text-gray-300 text-sm">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Image will be uploaded to Cloudinary. Recommended: 1200×600 (landscape).
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                {saving ? (mode === "edit" ? "Updating…" : "Saving…") : mode === "edit" ? "Update Post" : "Create Post"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/blogs")}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-medium">{title ? `${title.slice(0, 40)}${title.length > 40 ? "…" : ""}` : "Untitled"}</span>
              <span className="ml-3">•</span>
              <span className="ml-3">{published ? "Visible" : "Hidden"}</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogForm;
