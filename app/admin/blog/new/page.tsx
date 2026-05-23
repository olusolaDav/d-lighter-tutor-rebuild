"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditor } from "@/components/dashboard/blog/blog-editor"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [postId, setPostId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: { title: string; slug: string; content: string; thumbnail?: string | null }) => {
    setIsSaving(true)
    try {
      if (postId) {
        const res = await fetch(`/api/admin/blog/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            slug: data.slug,
            content: data.content,
            thumbnail: data.thumbnail,
            status: "draft",
          }),
        })
        const result = await res.json()
        if (result.ok) {
          console.log("Draft updated:", result.post._id)
        }
      } else {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            slug: data.slug,
            content: data.content,
            thumbnail: data.thumbnail,
            status: "draft",
          }),
        })
        const result = await res.json()
        if (result.ok && result.post) {
          setPostId(result.post._id)
          console.log("Draft created:", result.post._id)
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async () => {
    if (postId) {
      router.push(`/admin/blog/preview/${postId}`)
    } else {
      alert("Please save the post first before previewing.")
    }
  }

  const handlePublish = async () => {
    if (postId) {
      router.push(`/admin/blog/publish/${postId}`)
    } else {
      alert("Please save the post first before publishing.")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="New Blog Post"
        subtitle="Write and publish a new article for D-lighter readers"
        actions={
          <Link href="/admin/blog">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        }
      />
      <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-hidden">
        <div className="h-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <BlogEditor
            onSave={handleSave}
            onPreview={handlePreview}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </div>
  )
}
