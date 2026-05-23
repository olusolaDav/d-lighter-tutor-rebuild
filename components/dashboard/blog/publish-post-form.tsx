"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { CategoryDropdown } from "./sector-dropdown"
import type { BlogPost } from "@/lib/blog-data"

interface PublishPostFormProps {
  post?: BlogPost
  onPublishNow?: (data: PublishData) => void
  onSchedule?: (data: PublishData & { scheduledAt: string }) => void
  onClose?: () => void
}

interface PublishData {
  title: string
  metaDescription: string
  tags: string[]
}

export function PublishPostForm({ post, onPublishNow, onSchedule, onClose }: PublishPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || "")
  const [metaDescription, setMetaDescription] = useState(post?.excerpt || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(post?.tags || [])
  const maxDescriptionLength = 140

  // Extract first image from content for thumbnail
  const getFirstImage = (content: string): string | null => {
    const imgMatch = content?.match(/<img[^>]+src="([^"]+)"/);
    return imgMatch ? imgMatch[1] : null;
  }

  // Get thumbnail - prioritize post.thumbnail, then extract from content
  const thumbnailUrl = post?.thumbnail || (post?.content ? getFirstImage(post.content) : null) || "/blog-post-thumbnail.png"

  const handlePublishNow = () => {
    onPublishNow?.({
      title,
      metaDescription,
      tags: selectedCategories,
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold">Publish Post</h1>
        <button onClick={onClose || (() => router.back())} className="text-muted-foreground hover:text-foreground">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Left Column - Post Details */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              {post?.thumbnail ? (
                <Image src={thumbnailUrl || "/placeholder.svg"} alt="Post thumbnail" fill className="object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <p>Include a high-quality image in your story to</p>
                  <p>make it more inviting to readers.</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="border-0 border-b border-muted-foreground/30 px-0 text-xl font-semibold placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0"
              />
            </div>

            {/* Meta Description */}
            <div>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value.slice(0, maxDescriptionLength))}
                placeholder="Meta Description"
                className="min-h-[100px] resize-none border-0 border-b border-muted-foreground/30 px-0 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {metaDescription.length}/{maxDescriptionLength}
              </p>
            </div>

            {/* Note */}
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Note:</span> Changes here will affect how your story appears in public
              places like your blog homepage - not the contents of the story itself.
            </p>
          </div>

          {/* Right Column - Tags & Scheduling */}
          <div className="space-y-6">
            {/* Sectors/Tags */}
            <div>
              <h3 className="mb-3 font-semibold">
                Select categories (up to 3) to categorize
                <br />
                your blog post
              </h3>
              <CategoryDropdown
                value={selectedCategories}
                onChange={setSelectedCategories}
                maxSelections={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handlePublishNow}
                className="flex-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
