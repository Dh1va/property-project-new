import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBlog } from "../services/blogApi";
import DOMPurify from "dompurify";
import PageContainer from "../components/PageContainer";
import Breadcrumb from "../components/BreadCrumb";
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  ChevronLeft
} from "lucide-react";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlog(id);
        if (!mounted) return;
        setPost(data);
      } catch (err) {
        console.error(err);
        setError("Post not found");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-2 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The article you are looking for does not exist."}</p>
        <Link to="/blog" className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
          Return to Blog
        </Link>
      </div>
    );

  const sanitized = DOMPurify.sanitize(post.content || "", { ADD_ATTR: ["target"] });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const wordCount = post.content ? post.content.replace(/<[^>]+>/g, '').split(" ").length : 0;
  const readTime = Math.ceil(wordCount / 200);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(shareUrl);
      alert("Link copied to clipboard");
    }
  };

  return (
    <PageContainer className="pt-24 pb-20 bg-white">
      
      {/* Breadcrumb & Back */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: "Home", path: "/" }, 
            { label: "Blog", path: "/blog" }, 
            { label: "Article" }
          ]} 
        />
        <Link to="/blog" className="hidden sm:flex items-center text-sm font-medium text-gray-500 hover:text-black transition">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blog
        </Link>
      </div>

      <article className="max-w-5xl mx-auto">

        {/* Title + Meta */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{post.author || "Editorial Team"}</span>
            </div>
            <span className="text-gray-300">•</span>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <time>
                {new Date(post.createdAt || post.created_at).toLocaleDateString("en-US", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {post.imageUrl && (
          <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl mb-12 relative group">
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transform transition duration-700 group-hover:scale-105" 
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">

          {/* Left Sticky Share */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-32 flex flex-col items-center gap-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 writing-vertical">Share</p>

              <button 
                onClick={handleShare}
                className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition shadow-sm hover:shadow-md"
              >
                <LinkIcon className="w-5 h-5" />
              </button>

              <button className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-[#1877F2] hover:text-white transition shadow-sm hover:shadow-md">
                <Facebook className="w-5 h-5" />
              </button>

              <button className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition shadow-sm hover:shadow-md">
                <Twitter className="w-5 h-5" />
              </button>

              <button className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-[#0A66C2] hover:text-white transition shadow-sm hover:shadow-md">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="col-span-1 lg:col-span-8">

            {/* 🔥 Spacing Fix Applied Here */}
            <style>
              {`
                .blog-content > * + * {
                  margin-top: 1.5rem;
                }
                .blog-content p {
                  margin-bottom: 1.25rem;
                  line-height: 1.75;
                }
                .blog-content h1,
                .blog-content h2,
                .blog-content h3,
                .blog-content h4 {
                  margin-top: 2.2rem;
                  margin-bottom: 0.6rem;
                }
                .blog-content img {
                  display: block;
                  margin: 2rem auto;
                  max-width: 100%;
                }
                .blog-content ul,
                .blog-content ol {
                  margin: 1.25rem 0 1.25rem 1.25rem;
                }
                .blog-content blockquote {
                  margin: 1.5rem 0;
                  padding-left: 1rem;
                  border-left: 4px solid rgba(0,0,0,0.2);
                  background: rgba(0,0,0,0.03);
                }
              `}
            </style>

            <div
              className="blog-content prose prose-lg md:prose-xl prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />

            {/* Mobile Share */}
            <div className="lg:hidden mt-12 pt-8 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-4">Share this article</p>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Author Section */}
            <div className="mt-16 bg-gray-50 rounded-2xl p-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                {(post.author || "A").charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Written by</p>
                <h4 className="text-lg font-bold text-gray-900">{post.author || "Podab Editorial"}</h4>
                <p className="text-gray-600 text-sm mt-2">
                  Thanks for reading! Keep checking back for more insights.
                </p>
              </div>
            </div>

          </div>

          <div className="hidden lg:block lg:col-span-2"></div>
        </div>
      </article>
    </PageContainer>
  );
};

export default BlogDetail;
