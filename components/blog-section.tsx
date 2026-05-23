"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Eye, Heart, Share2, ArrowRight, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  thumbnail: string
  author?: { name: string }
  authorName?: string
  authorRole?: string
  authorId?: string
  views: number
  likes: number
  shares: number
  readTime: number
  publishedAt?: string
  createdAt: string
  tags: string[]
}

function formatBlogDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function decodeExcerpt(text: string): string {
  if (!text) return ""
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog?limit=3")
        const data = await res.json()
        if (data.ok && Array.isArray(data.posts)) {
          setPosts(data.posts.slice(0, 3))
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (loading || posts.length === 0) return null

  return (
    <section id="blog" ref={sectionRef} className="relative overflow-hidden py-20 bg-white">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)" }}
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 px-5 py-2 rounded-full mb-5">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">From Our Blog</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Latest <span className="text-amber-500">Insights</span> & Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert tips, tutoring advice, and resources to help your child thrive academically and embrace their heritage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => {
            const isAdminPost = post.authorRole === "admin" || !post.authorId
            const authorName = post.author?.name || (isAdminPost ? "D-lighter Tutor" : post.authorName || "Author")
            const postUrl = `/blog/${post.slug}`
            const excerpt = decodeExcerpt(post.excerpt).slice(0, 130)

            return (
              <article
                key={post._id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(40px)",
                  transitionDelay: `${index * 100 + 200}ms`,
                }}
              >
                <Link href={postUrl} className="block relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={post.thumbnail || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span className="font-medium">{authorName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                    </span>
                  </div>

                  <Link href={postUrl}>
                    <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-amber-600 transition-colors mb-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-4">
                    {excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{post.shares}</span>
                    </div>
                    <Link href={postUrl} className="text-sm font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors">
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div
          className="text-center mt-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transitionDelay: "400ms" }}
        >
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 h-12 rounded-full shadow-md">
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
