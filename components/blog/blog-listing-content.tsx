"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Heart, Share2, ChevronLeft, ChevronRight, Loader2, Eye, Search, User, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useBookingForm } from "@/components/booking-form-modal"

// Academic categories suitable for D-lighter Tutor
export const BLOG_CATEGORIES = [
  "Mathematics",
  "English & Literacy",
  "Science",
  "African Languages",
  "African Heritage & Culture",
  "Parenting Tips",
  "Study Skills",
  "Exam Preparation",
  "Primary Education",
  "Secondary Education",
  "Online Learning",
  "Homework Help",
]

function decodeHtmlEntities(text: string): string {
  if (!text) return ""
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...")
    .replace(/<[^>]+>/g, "")
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  category?: string
  author?: { _id: string; name: string; avatar?: string }
  authorId?: string
  authorName?: string
  authorRole?: string
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  featured?: boolean
  createdAt: string
  publishedAt?: string
  updatedAt: string
}

function formatBlogDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function BlogListingContent() {
  const { openModal } = useBookingForm()
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const postsPerPage = 6

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog?limit=100")
        if (!res.ok) {
          console.error("Error fetching posts: /api/blog returned", res.status)
          return
        }

        const contentType = res.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) {
          console.error("Error fetching posts: expected JSON but got", contentType || "unknown content type")
          return
        }

        const data = await res.json()
        if (data.ok && Array.isArray(data.posts)) {
          setPosts(data.posts.map((p: any) => {
            const isAdminPost = p.authorRole === "admin" || !p.authorId
            return {
              _id: p._id || "",
              title: p.title || "Untitled",
              slug: p.slug || "",
              content: p.content || "",
              excerpt: p.excerpt || "",
              thumbnail: p.thumbnail || "/placeholder.svg",
              category: p.category || p.tags?.[0] || null,
              author: { _id: p.authorId || "admin", name: isAdminPost ? "D-lighter Tutor" : (p.authorName || "Author"), avatar: p.authorAvatar },
              authorId: p.authorId,
              authorRole: p.authorRole,
              status: p.status || "published",
              tags: p.tags || [],
              views: p.views || 0,
              commentsCount: p.commentsCount || 0,
              likes: p.likes || 0,
              shares: p.shares || 0,
              readTime: p.readTime || 5,
              featured: !!p.featured,
              createdAt: p.createdAt || new Date().toISOString(),
              publishedAt: p.publishedAt,
              updatedAt: p.updatedAt || new Date().toISOString(),
            }
          }))
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    let result = [...posts]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((p) =>
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s) ||
        (p.author?.name || "").toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s))
      )
    }
    if (selectedCategory) {
      result = result.filter((p) =>
        p.category === selectedCategory ||
        p.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase())
      )
    }
    return result
  }, [posts, search, selectedCategory])

  // Derive categories that actually exist in posts
  const activeCategories = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => {
      if (p.category) set.add(p.category)
      p.tags?.forEach((t) => set.add(t))
    })
    // Return BLOG_CATEGORIES that have posts, plus any extra tags
    return BLOG_CATEGORIES.filter((c) => set.has(c))
      .concat(Array.from(set).filter((t) => !BLOG_CATEGORIES.includes(t)))
  }, [posts])

  const featuredPost = useMemo(() => posts.find((post) => post.featured) || null, [posts])
  const popularPosts = useMemo(() => [...posts].sort((a, b) => b.views - a.views).slice(0, 4), [posts])
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-white">
        <div className="container mx-auto px-4 flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-sm text-muted-foreground">Loading articles…</p>
          </div>
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section className="min-h-[60vh] bg-white">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center h-64">
          <Tag className="w-12 h-12 text-muted-foreground/30" />
          <h3 className="text-xl font-semibold text-foreground">No articles yet</h3>
          <p className="text-muted-foreground">Check back soon — we publish new content regularly.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white min-h-screen">
      {/* Sticky filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-3 overflow-x-auto scrollbar-hide">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setSearch(searchInput); setCurrentPage(1) }
                }}
                className="pl-8 pr-3 h-8 w-36 rounded-full border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 transition"
              />
            </div>
            {searchInput && (
              <button
                onClick={() => { setSearch(searchInput); setCurrentPage(1) }}
                className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 transition"
              >
                Search
              </button>
            )}
            {search && (
              <button
                onClick={() => { setSearch(""); setSearchInput(""); setCurrentPage(1) }}
                className="flex-shrink-0 h-8 px-3 rounded-full text-xs text-muted-foreground border border-gray-200 hover:border-gray-300 transition"
              >
                Clear
              </button>
            )}
            {/* Divider */}
            <span className="w-px h-5 bg-gray-200 flex-shrink-0" />
            {/* Category pills */}
            <button
              onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
              className={cn(
                "flex-shrink-0 h-8 px-4 rounded-full text-xs font-medium transition",
                !selectedCategory
                  ? "bg-secondary text-white"
                  : "text-muted-foreground hover:bg-gray-100"
              )}
            >
              All
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setCurrentPage(1) }}
                className={cn(
                  "flex-shrink-0 h-8 px-4 rounded-full text-xs font-medium whitespace-nowrap transition",
                  selectedCategory === cat
                    ? "bg-secondary text-white"
                    : "text-muted-foreground hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-10">
          {/* Feed */}
          <div className="flex-1 min-w-0">
            {/* Search result notice */}
            {search && (
              <p className="text-sm text-muted-foreground mb-5">
                {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} for <strong>"{search}"</strong>
              </p>
            )}

            {paginatedPosts.length === 0 ? (
              <div className="flex flex-col py-20 items-center text-center">
                <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="font-semibold text-foreground mb-1">No articles found</p>
                <p className="text-sm text-muted-foreground">Try a different search or category.</p>
                <button
                  onClick={() => { setSearch(""); setSearchInput(""); setSelectedCategory(null); setCurrentPage(1) }}
                  className="mt-4 text-sm text-secondary font-medium hover:underline underline-offset-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedPosts.map((post, i) => (
                  <MediumPostRow
                    key={post._id}
                    post={post}
                    featured={!!post.featured}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-muted-foreground hover:border-secondary/50 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-full text-sm font-medium transition",
                        currentPage === page
                          ? "bg-secondary text-white"
                          : "border border-gray-200 text-muted-foreground hover:border-secondary/50 hover:text-secondary"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-muted-foreground hover:border-secondary/50 hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0 hidden lg:block space-y-8 pt-2">
            {/* Popular articles */}
            {popularPosts.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
                  Popular Articles
                </h3>
                <div className="space-y-5">
                  {popularPosts.map((post, i) => (
                    <Link key={post._id} href={`/blog/${post.slug}`} className="group flex gap-3 items-start">
                      <span className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">{post.author?.name}</span>
                        </p>
                        <p className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-secondary transition-colors leading-snug mb-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {post.views} views · {post.readTime} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended topics */}
            {activeCategories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
                  Recommended Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setCurrentPage(1) }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-medium border transition",
                        selectedCategory === cat
                          ? "bg-secondary text-white border-secondary"
                          : "bg-gray-100 text-muted-foreground border-transparent hover:bg-secondary/10 hover:text-secondary"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enrol CTA */}
            <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, oklch(0.16 0.03 250) 0%, oklch(0.45 0.09 248) 100%)" }}>
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1.5">Ready to Enrol Your Child?</h3>
              <p className="text-white/70 text-xs mb-4 leading-relaxed">
                Book a free trial lesson — no commitment, no credit card.
              </p>
              <button
                onClick={() => openModal()}
                className="w-full py-2 px-4 rounded-full bg-white hover:bg-gray-100 text-foreground text-xs font-semibold transition"
              >
                Book Free Trial
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

// Import BookOpen here for sidebar use
import { BookOpen } from "lucide-react"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function MediumPostRow({ post, featured }: { post: BlogPost; featured?: boolean }) {
  const postUrl = `/blog/${post.slug}`
  const rawExcerpt = post.excerpt || (post.content || "").replace(/<[^>]+>/g, "").slice(0, 200)
  const excerpt = decodeHtmlEntities(rawExcerpt)

  return (
    <article className="group rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/40 hover:border-secondary/20 p-6 sm:p-8 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-stretch gap-5 sm:gap-7">

        {/* Text content — 70% on desktop */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
          <div>
            {/* Author row */}
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              {post.author?.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {getInitials(post.author?.name || "DT")}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{post.author?.name}</span>
                {post.category && (
                  <>
                    {" "}·{" "}
                    <span className="text-secondary font-medium">{post.category}</span>
                  </>
                )}
                {" · "}
                {formatBlogDate(post.publishedAt || post.createdAt)}
              </span>
              {featured && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <Link href={postUrl}>
              <h2 className={cn(
                "font-bold text-foreground leading-snug group-hover:text-secondary transition-colors mb-3",
                featured ? "text-2xl md:text-3xl line-clamp-2" : "text-xl md:text-2xl line-clamp-2"
              )}>
                {post.title}
              </h2>
            </Link>

            {/* Excerpt */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
              {excerpt}
            </p>
          </div>

          {/* Bottom meta */}
          <div className="flex items-center gap-3 sm:gap-5 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {post.readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> {post.views}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> {post.likes}
            </span>
            <Link
              href={postUrl}
              className="ml-auto inline-flex items-center gap-2 text-sm font-semibold bg-secondary text-white hover:bg-secondary/90 px-5 py-2.5 rounded-full transition-all shadow-sm"
            >
              Read article <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Thumbnail — 30% on desktop, 16:9 on mobile */}
        <Link
          href={postUrl}
          className="w-full aspect-video sm:w-[30%] sm:aspect-auto flex-shrink-0 rounded-xl overflow-hidden bg-gray-100"
        >
          <Image
            src={post.thumbnail || "/placeholder.svg"}
            alt={post.title}
            width={320}
            height={220}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
    </article>
  )
}
