"use client"

import { useParams, useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { BlogDetailHero } from "@/components/blog/blog-detail-hero"
import { BlogDetailContent } from "@/components/blog/blog-detail-content"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  description?: string
  excerpt: string
  thumbnail: string
  authorId?: string
  authorName?: string
  authorAvatar?: string
  authorRole?: string
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  updatedAt: string
}

export default function PreviewBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const basePath = pathname.startsWith("/super-admin") ? "/super-admin" : "/admin"
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/blog/${postId}`)
        const data = await res.json()
        if (data.ok && data.post) {
          const p = data.post
          setPost({
            ...p,
            excerpt: p.excerpt || "",
            thumbnail: p.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
            tags: p.tags || [],
            views: p.views || 0,
            commentsCount: p.commentsCount || 0,
            likes: p.likes || 0,
            shares: p.shares || 0,
            readTime: p.readTime || 5,
            updatedAt: p.updatedAt || p.createdAt,
          })
        }
      } catch (err) {
        console.error("Error fetching post:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
        <button
          onClick={() => router.push(`${basePath}/blog`)}
          className="mt-4 text-primary hover:underline"
        >
          Back to Blog Posts
        </button>
      </div>
    )
  }

  const isAdminPost = post.authorRole === "admin" || !post.authorId

  const formattedPost = {
    _id: post._id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    description: post.description,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    author: {
      _id: post.authorId || "admin",
      name: isAdminPost ? "Alot Digital Agency" : (post.authorName || "Unknown"),
      avatar: post.authorAvatar,
      role: isAdminPost ? "admin" : "blogger",
    },
    status: post.status,
    tags: post.tags,
    views: post.views,
    commentsCount: post.commentsCount,
    likes: post.likes,
    shares: post.shares,
    readTime: post.readTime,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  }

  return (
    <div className="relative -mx-6 -mt-6">
      {/* Preview toolbar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-yellow-50 px-6 py-3 dark:bg-yellow-950/30">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Preview Mode
          </span>
          <span className="text-sm text-muted-foreground">This is how the post will look when published</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/blog/edit/${postId}`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Button>
          <Button size="sm" onClick={() => router.push(`${basePath}/blog/publish/${postId}`)} className="gap-2">
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <BlogDetailHero post={formattedPost} />
      <BlogDetailContent post={formattedPost} />
    </div>
  )
}
