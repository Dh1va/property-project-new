import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchBlogs, deleteBlog } from "../services/blogApi";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs({ all: true, limit: 200 });
      setBlogs(data || []);
    } catch (err) {
      console.error("load blogs", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this post? This will permanently remove it.")) return;
    setBusy(true);
    try {
      await deleteBlog(id);
      setBlogs((s) => s.filter((b) => (b._id || b.id) !== id));
    } catch (err) {
      console.error("delete blog", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const getStatusClasses = (isPublished) => {
    if (isPublished) {
      return "bg-green-100 text-green-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-8 px-4 sm:px-6">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Blog Posts</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/admin/blogs/new")}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            aria-label="Create new blog post"
          >
            <FaPlus className="w-4 h-4" />
            <span className="text-sm">New Post</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <p>Loading blog posts…</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">No blog posts found.</p>
            <p className="text-sm mt-1">Start by creating your first article!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {blogs.map((b) => {
              const id = b._id || b.id;
              const statusClasses = getStatusClasses(b.published);

              return (
                <div
                  key={id}
                  className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center transition hover:bg-gray-50"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-full sm:w-28 md:w-36 h-40 sm:h-16 md:h-20 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center text-gray-400 w-full h-full">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Title and Excerpt */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="font-semibold text-gray-900 text-base sm:text-lg truncate mr-2">
                        <Link to={`/blog/${id}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">
                          {b.title || "Untitled Post"}
                        </Link>
                      </div>

                      {/* Right side (status + date) for small screens it will appear under actions */}
                      <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 w-36">
                        <span className={`text-xs px-3 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusClasses}`}>
                          {b.published ? "Published" : "Draft"}
                        </span>
                        <div className="text-xs text-gray-500 whitespace-nowrap mt-1">
                          {new Date(b.createdAt || b.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {b.excerpt ? b.excerpt.slice(0, 180) + (b.excerpt.length > 180 ? "…" : "") : "No excerpt provided."}
                    </div>

                    {/* Mobile-only status/date shown below content */}
                    <div className="flex items-center justify-between gap-3 mt-3 sm:hidden">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusClasses}`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                      <div className="text-xs text-gray-500">{new Date(b.createdAt || b.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                    <Link
                      to={`/admin/blogs/${id}/edit`}
                      className="text-sm inline-flex items-center justify-center w-9 h-9 rounded-md text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition"
                      title="Edit Post"
                      aria-label={`Edit ${b.title || 'post'}`}
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      disabled={busy}
                      onClick={() => handleDelete(id)}
                      className="text-sm inline-flex items-center justify-center w-9 h-9 rounded-md text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-50 transition"
                      title="Delete Post"
                      aria-label={`Delete ${b.title || 'post'}`}
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaTrash className="w-3.5 h-3.5" />}
                    </button>

                    <Link
                      to={`/blog/${id}`}
                      className="text-sm inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-600 border border-gray-100 hover:bg-gray-100 transition"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Post"
                      aria-label={`View ${b.title || 'post'}`}
                    >
                      View
                    </Link>
                  </div>

                  {/* For larger screens this is already shown. For small screens show status/date underneath actions */}
                  <div className="hidden sm:block" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
