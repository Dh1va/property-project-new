// src/components/BlogList.jsx
import React, { useEffect, useState } from "react";
import { fetchBlogs } from "../services/blogApi";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Image as ImageIcon } from "lucide-react";

const BlogList = ({ title = "Latest Insights", limit = 6 }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogs({ limit });
        if (!mounted) return;
        setBlogs(data || []);
      } catch (err) {
        console.error("fetchBlogs error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [limit]);

  // Premium Skeleton Loader
  if (loading) {
    return (
      <section className="mt-12 mb-12">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-56 bg-gray-100 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!blogs.length) return null;

  return (
    <section className="mt-12 mb-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-gray-500">Market trends, real estate tips, and news.</p>
        </div>
        
        <Link 
          to="/blog" 
          className="hidden md:flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-600 transition group"
        >
          View All Posts 
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <Link 
            to={`/blog/${b._id || b.id}`} 
            key={b._id || b.id} 
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Image Container */}
            <div className="h-56 w-full overflow-hidden relative bg-gray-100">
              {b.imageUrl ? (
                <img 
                  src={b.imageUrl} 
                  alt={b.title} 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs uppercase font-medium">No Image</span>
                </div>
              )}
              {/* Optional: Category Badge (if you have categories, uncomment below) */}
              {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                 News
              </div> */}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <Calendar className="w-3 h-3" />
                <time>{new Date(b.createdAt || b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-black transition-colors">
                {b.title}
              </h3>
              
              {b.excerpt && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                  {b.excerpt}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-black flex items-center gap-2 group-hover:underline decoration-2 underline-offset-4">
                  Read Article
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 transform transition-transform group-hover:translate-x-1 group-hover:text-black" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 md:hidden text-center">
        <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            View All Posts
        </Link>
      </div>
    </section>
  );
};

export default BlogList;