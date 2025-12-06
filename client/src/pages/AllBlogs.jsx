// src/pages/AllBlogs.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchBlogs } from "../services/blogApi";
import { ArrowRight, Calendar, Image as ImageIcon } from "lucide-react";

/**
 * AllBlogs page
 * - Uses fetchBlogs({ all: true }) to fetch everything and paginates on client side.
 * - If your dataset is very large, consider switching to server pagination.
 */
export default function AllBlogs() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);
  const [showAllResults, setShowAllResults] = useState(false);

  const searchTimer = useRef(null);

  // fetch all blogs once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogs({ all: true, limit: 1000 }); // limit is accepted by your API
        if (!mounted) return;
        // If API returns { items: [] } or plain array, handle both:
        const items = Array.isArray(data) ? data : (data.items ?? data);
        setAllBlogs(items || []);
      } catch (err) {
        console.error("fetchBlogs(all) error", err);
        setError("Unable to load articles right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // derive categories from posts (if posts contain `category` field)
  const categories = useMemo(() => {
    const set = new Set();
    set.add("All");
    allBlogs.forEach((b) => {
      if (b.category) {
        // category might be a string or array
        if (Array.isArray(b.category)) {
          b.category.forEach((c) => c && set.add(c));
        } else if (typeof b.category === "string" && b.category.trim()) {
          set.add(b.category.trim());
        }
      }
    });
    return Array.from(set);
  }, [allBlogs]);

  // filtered list based on search + category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBlogs.filter((b) => {
      // category filter
      if (selectedCategory !== "All") {
        const cat = b.category;
        if (Array.isArray(cat)) {
          if (!cat.map((c) => String(c).toLowerCase()).includes(selectedCategory.toLowerCase())) return false;
        } else if (cat) {
          if (String(cat).toLowerCase() !== selectedCategory.toLowerCase()) return false;
        } else {
          return false;
        }
      }

      if (!q) return true;
      // search title, excerpt, content, author
      const hay = `${b.title || ""} ${b.excerpt || ""} ${b.content || ""} ${b.author || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allBlogs, query, selectedCategory]);

  // debounce search to avoid rapid re-renders
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [query, selectedCategory]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageIndex = Math.min(Math.max(1, page), totalPages);

  const paged = useMemo(() => {
    if (showAllResults) return filtered;
    const start = (pageIndex - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize, showAllResults]);

  // small helpers
  const goToPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  // card (kept visually consistent with your existing BlogList)
  const BlogCard = ({ b }) => {
    const navigate = useNavigate();
    const id = b._id || b.id;
    return (
      <article className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition ">
        <Link to={`/blog/${id}`} className="block group">
          <div className="w-full h-56 bg-gray-100 overflow-hidden">
            {b.imageUrl ? (
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover transform transition group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <ImageIcon className="w-10 h-10 mb-2" />
                <span className="text-xs uppercase font-medium">No Image</span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            <Calendar className="w-3 h-3" />
            <time>{new Date(b.createdAt || b.created_at).toLocaleDateString()}</time>
          </div>

          <Link to={`/blog/${id}`} className="block">
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-black transition-colors">
              {b.title}
            </h3>
          </Link>

          {b.excerpt && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
              {b.excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            {/* Changed to a button so it's clickable and shows pointer */}
            <button
              onClick={() => navigate(`/blog/${id}`)}
              className="text-sm font-semibold text-black flex items-center gap-2 group-hover:underline decoration-2 underline-offset-4 cursor-pointer"
              aria-label={`Read article ${b.title || ""}`}
            >
              Read Article
            </button>

            <ArrowRight className="w-4 h-4 text-gray-400 transform transition group-hover:translate-x-1 group-hover:text-black" />
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="pt-30 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">All Articles</h1>
            <p className="mt-1 text-sm text-gray-600">Browse every post. Use search and filters to find what you need.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <label htmlFor="search" className="sr-only">Search articles</label>
              <input
                id="search"
                type="search"
                placeholder="Search by title, excerpt or content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                aria-label="Search all blog posts"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
              aria-label="Results per page"
            >
              <option value={6}>6 / page</option>
              <option value={9}>9 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>

            <button
              onClick={() => { setShowAllResults((s) => !s); }}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm border hover:bg-gray-200"
            >
              {showAllResults ? "Paged view" : "Show all"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-sm text-red-600 mb-6">{error}</div>}

        {/* Content */}
        {loading ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg bg-white">
                <div className="h-44 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-4" />
              </div>
            ))}
          </section>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-800">No articles found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50">
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paged.map((b) => <BlogCard b={b} key={b._id || b.id} />)}
            </div>

            {/* Pagination */}
            {!showAllResults && (
              <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{Math.min(1 + (pageIndex-1) * pageSize, total)}</span> — <span className="font-medium">{Math.min(pageIndex * pageSize, total)}</span> of <span className="font-medium">{total}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 border rounded-md text-sm"
                    onClick={() => goToPage(1)}
                    disabled={pageIndex === 1}
                    aria-label="First page"
                  >
                    {"«"}
                  </button>

                  <button
                    className="px-3 py-1 border rounded-md text-sm"
                    onClick={() => goToPage(pageIndex - 1)}
                    disabled={pageIndex === 1}
                    aria-label="Previous page"
                  >
                    Prev
                  </button>

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // sliding window of pages around current
                      const half = Math.floor(5 / 2);
                      let start = Math.max(1, pageIndex - half);
                      let end = Math.min(totalPages, start + 4);
                      if (end - start < 4) start = Math.max(1, end - 4);
                      const pages = [];
                      for (let p = start; p <= end; p++) pages.push(p);
                      return pages.map((p) => (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`px-3 py-1 rounded-md text-sm ${p === pageIndex ? "bg-black text-white" : "border"}`}
                          aria-current={p === pageIndex ? "page" : undefined}
                        >
                          {p}
                        </button>
                      ));
                    })}
                  </div>

                  <button
                    className="px-3 py-1 border rounded-md text-sm"
                    onClick={() => goToPage(pageIndex + 1)}
                    disabled={pageIndex === totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </button>

                  <button
                    className="px-3 py-1 border rounded-md text-sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={pageIndex === totalPages}
                    aria-label="Last page"
                  >
                    {"»"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
