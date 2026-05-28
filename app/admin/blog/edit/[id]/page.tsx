"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { BlogEditor } from "@/components/dashboard/blog/blog-editor"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status: "published" | "draft" | "scheduled"
  tags?: string[]
  featured?: boolean
}

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(Date.now())
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    // Reset state when postId changes
    setPost(null)
    setLoading(true)
    setError(null)
    
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/blog/${postId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        const data = await res.json()
        console.log("Fetched post data:", data)
        if (data.ok && data.post) {
          setPost(data.post)
          setFeatured(!!data.post.featured)
          setEditorKey(Date.now())
        } else {
          setError("Post not found")
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const handleSave = async (data: { title: string; slug: string; content: string; thumbnail?: string | null }) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          content: data.content,
          thumbnail: data.thumbnail,
          featured,
        }),
      })
      const result = await res.json()
      if (result.ok) {
        console.log("Post updated:", result.post._id)
        setPost(result.post)
      }
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  const handlePreview = () => {
    router.push(`/admin/blog/preview/${postId}`)
  }

  const handlePublish = () => {
    router.push(`/admin/blog/publish/${postId}`)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">{error || "Post not found"}</p>
        <button
          onClick={() => router.push("/admin/blog")}
          className="mt-4 text-primary hover:underline"
        >
          Back to Blog Posts
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Edit Blog Post"
        subtitle={post.title}
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <Switch checked={featured} onCheckedChange={setFeatured} id="featured-blog" />
              <Label htmlFor="featured-blog" className="cursor-pointer text-sm font-medium">
                Featured
              </Label>
            </div>
            <Link href="/admin/blog">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <ChevronLeft className="w-4 h-4" /> Back to Blog
              </Button>
            </Link>
          </div>
        }
      />
      <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-hidden">
        <div className="h-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <BlogEditor
            key={editorKey}
            initialTitle={post.title}
            initialContent={post.content}
            postId={post._id}
            onSave={handleSave}
            onPreview={handlePreview}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </div>
  )
}
