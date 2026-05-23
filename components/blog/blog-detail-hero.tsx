"use client"

import { BookOpen, Clock, Calendar, Eye } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { cn } from "@/lib/utils"
import { BlogEngagementButtons } from "./blog-engagement-buttons"
import { useEffect, useState } from "react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
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

interface BlogDetailHeroProps {
  post: BlogPost
}

function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BlogDetailHero({ post }: BlogDetailHeroProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const primaryTag = post.tags?.[0] || "General"

  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-10">
      {/* Doodle background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url('/doodle_blue.png')",
          backgroundSize: "800px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-secondary/10 px-5 py-2.5 rounded-full mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary uppercase tracking-wide">
              {primaryTag}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 text-balance leading-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {post.title}
          </h1>

          {/* Meta info */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 text-sm transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground border rounded-full px-3 py-1">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0} views</span>
            </div>
            <BlogEngagementButtons
              postId={post._id}
              postSlug={post.slug}
              postTitle={post.title}
              initialLikes={post.likes}
              initialShares={post.shares}
              variant="header"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
