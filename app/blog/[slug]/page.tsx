
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { BlogDetailHero } from "@/components/blog/blog-detail-hero"
import { BlogDetailContent } from "@/components/blog/blog-detail-content"
import { BlogComments } from "@/components/blog/blog-comments"
import { BlogViewTracker } from "@/components/blog/blog-view-tracker"
import { RelatedPosts } from "@/components/blog/related-posts"

import { getBlogBySlug, listPublishedCommentsByPost, listPublishedBlogs, type Blog } from "@/lib/blog"
import { notFound } from "next/navigation"
import { generateBlogPostMetadata, generateBlogPostSchema, generateBreadcrumbSchema, SITE_URL, SITE_NAME } from "@/lib/seo.config"
import Script from "next/script"


interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate dynamic metadata for blog posts (SEO)
 */
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug) as Blog | null

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist.",
    }
  }

  const isAdminPost = (post as any).authorRole === "admin" || !post.authorId

  return generateBlogPostMetadata({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    description: (post as any).description,
    thumbnail: post.thumbnail,
    authorName: isAdminPost ? "D-lighter Tutor" : (post.authorName || "Author"),
    tags: post.tags,
    category: (post as any).category,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt ? String(post.publishedAt) : undefined,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : String(post.updatedAt),
  })
}

/**
 * Pre-generate static paths for published blog posts
 */
export async function generateStaticParams() {
  try {
    const { posts } = await listPublishedBlogs(5000, 0)
    return (posts || []).map((post: { slug: string }) => ({
      slug: post.slug,
    }))
  } catch {
    return []
  }
}



export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await getBlogBySlug(slug) as Blog | null

  if (!post) {
    notFound()
  }

  // View tracking is now handled client-side to prevent duplicate counts

  const commentsData = await listPublishedCommentsByPost(post._id as string)
  
  // Determine if this is an admin-created post - check authorRole OR absence of authorId
  const isAdminPost = (post as any).authorRole === "admin" || !post.authorId
  
  const formattedPost = {
    _id: post._id as string,
    title: post.title,
    slug: post.slug,
    content: post.content,
    description: (post as any).description, // Optional description
    excerpt: post.excerpt || "",
    thumbnail: post.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
    author: {
      _id: post.authorId || "admin",
      name: isAdminPost ? "D-lighter Tutor" : (post.authorName || "Author"),
      avatar: post.authorAvatar,
      role: isAdminPost ? "admin" : "blogger",
    },
    updatedBy: post.updatedById ? {
      _id: post.updatedById,
      name: post.updatedByName || "Unknown",
      avatar: post.updatedByAvatar,
    } : undefined,
    status: post.status as "published" | "draft" | "scheduled",
    tags: post.tags || [],
    views: post.views || 0,
    commentsCount: post.commentsCount || 0,
    likes: post.likes || 0,
    shares: post.shares || 0,
    readTime: post.readTime || 5,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt ? String(post.publishedAt) : undefined,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : String(post.updatedAt),
  }

  const formattedComments = commentsData.map((c: any) => ({
    _id: c._id,
    postId: c.postId,
    postTitle: c.postTitle || post.title,
    author: {
      _id: c.authorId || "anonymous",
      name: c.authorName || "Anonymous",
      avatar: c.authorAvatar || "/placeholder-user.jpg",
    },
    content: c.content,
    status: c.status as "published" | "unpublished" | "pending",
    likes: c.likes || 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  // Generate BlogPosting JSON-LD schema
  const blogSchema = generateBlogPostSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    description: (post as any).description,
    thumbnail: post.thumbnail,
    authorName: formattedPost.author.name,
    tags: formattedPost.tags,
    category: (post as any).category,
    publishedAt: formattedPost.publishedAt,
    updatedAt: formattedPost.updatedAt,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      {/* Blog Post Structured Data */}
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Script
        id="blog-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogViewTracker postId={post._id as string} slug={post.slug} />
      <BlogDetailHero post={formattedPost} />
      <BlogDetailContent post={formattedPost} />
      <BlogComments comments={formattedComments} postId={post._id as string} postSlug={post.slug} />
      <RelatedPosts currentPostId={post._id as string} currentPostTags={formattedPost.tags} />
  <Footer />
    </main>
  )
}
