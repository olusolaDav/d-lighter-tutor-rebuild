"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { withAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, MessageSquare, Plus, Loader2, Trash2 } from "lucide-react"
import { BlogCard } from "@/components/dashboard/blog/blog-card"
import { AddTagsModal } from "@/components/dashboard/blog/add-tags-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  authorId?: string
  authorName?: string
  authorAvatar?: string
  status: "published" | "draft" | "scheduled"
  tags: string[]
  views: number
  commentsCount: number
  likes: number
  shares: number
  readTime: number
  createdAt: string
  publishedAt?: string
  scheduledAt?: string
  updatedAt: string
}

type BlogTab = "all" | "drafts" | "published"

function AdminBlogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = pathname.startsWith("/super-admin") ? "/super-admin" : "/admin"
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<BlogTab>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [tagsModalOpen, setTagsModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 6

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/blog")
      const data = await res.json()
      if (data.ok && data.posts) {
        setPosts(data.posts.map((p: any) => ({
          _id: p._id || "",
          title: p.title || "Untitled",
          slug: p.slug || "",
          content: p.content || "",
          excerpt: p.excerpt || "",
          thumbnail: p.thumbnail || "/data-protection-cybersecurity-cloud.jpg",
          authorId: p.authorId || "admin",
          authorName: p.authorName || "Admin",
          authorAvatar: p.authorAvatar || "/professional-man-avatar.png",
          status: p.status || "draft",
          tags: p.tags || [],
          views: p.views || 0,
          commentsCount: p.commentsCount || 0,
          likes: p.likes || 0,
          shares: p.shares || 0,
          readTime: p.readTime || 5,
          createdAt: p.createdAt || new Date().toISOString(),
          publishedAt: p.publishedAt,
          scheduledAt: p.scheduledAt,
          updatedAt: p.updatedAt || new Date().toISOString(),
        })))
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(searchLower) || p.excerpt?.toLowerCase().includes(searchLower),
      )
    }

    if (activeTab === "drafts") {
      result = result.filter((p) => p.status === "draft")
    } else if (activeTab === "published") {
      result = result.filter((p) => p.status === "published")
    }

    return result
  }, [posts, search, activeTab])

  const allCount = posts.length
  const draftsCount = posts.filter((p) => p.status === "draft").length
  const publishedCount = posts.filter((p) => p.status === "published").length

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (post: BlogPost) => {
    router.push(`${basePath}/blog/edit/${post._id}`)
  }

  const handleView = (post: BlogPost) => {
    if (post.status === "published") {
      window.open(`/blog/${post.slug}`, "_blank")
    } else {
      router.push(`${basePath}/blog/preview/${post._id}`)
    }
  }

  const handlePublish = (post: BlogPost) => {
    router.push(`${basePath}/blog/publish/${post._id}`)
  }

  const handleUnpublish = async (postId: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error unpublishing post:", error)
    }
  }

  const handleRevertToDraft = async (postId: string) => {
    await handleUnpublish(postId)
  }

  const handleDelete = async (postId: string) => {
    setPostToDelete(postId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!postToDelete) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/${postToDelete}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeleteConfirmOpen(false)
        setPostToDelete(null)
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddTags = (post: BlogPost) => {
    setSelectedPost(post)
    setTagsModalOpen(true)
  }

  const handleSaveTags = async (tags: string[]) => {
    if (selectedPost) {
      try {
        await fetch(`/api/admin/blog/${selectedPost._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags }),
        })
        fetchPosts()
      } catch (error) {
        console.error("Error saving tags:", error)
      }
    }
    setSelectedPost(null)
  }

  const handleViewComments = () => {
    router.push(`${basePath}/blog/comments`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader title="Blog Posts" subtitle="Create and manage your blog content" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Blog Posts"
        subtitle="Create and manage your blog content"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleViewComments} className="gap-2 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`${basePath}/blog/new`)}
              className="gap-2 text-xs bg-secondary hover:bg-secondary/90 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

      <div className="border-b border-gray-200 mb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm rounded-xl border-gray-200"
              />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("all")
              setCurrentPage(1)
            }}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === "all"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => {
              setActiveTab("drafts")
              setCurrentPage(1)
            }}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === "drafts"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Drafts ({draftsCount})
          </button>
          <button
            onClick={() => {
              setActiveTab("published")
              setCurrentPage(1)
            }}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === "published"
                ? "border-secondary text-secondary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Published ({publishedCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedPosts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No posts found</h3>
            <p className="text-muted-foreground">Create your first blog post to get started.</p>
            <Button
              onClick={() => router.push(`${basePath}/blog/new`)}
              className="mt-4 gap-2 bg-secondary hover:bg-secondary/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        ) : (
          paginatedPosts.map((post) => (
            <BlogCard
              key={post._id}
              post={post as any}
              onEdit={() => handleEdit(post)}
              onView={() => handleView(post)}
              onPreview={() => handleView(post)}
              onPublish={() => handlePublish(post)}
              onUnpublish={() => handleUnpublish(post._id)}
              onRevertToDraft={() => handleRevertToDraft(post._id)}
              onViewComments={handleViewComments}
              onAddTags={() => handleAddTags(post)}
              onDelete={() => handleDelete(post._id)}
              onDiscard={() => handleDelete(post._id)}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedPosts.length} post(s) of {filteredPosts.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Back
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={cn("h-8 w-8 p-0", currentPage === page && "bg-primary text-primary-foreground")}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <AddTagsModal
        open={tagsModalOpen}
        onOpenChange={setTagsModalOpen}
        initialTags={selectedPost?.tags}
        onSave={handleSaveTags}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}

export default withAuth(AdminBlogPage, ["admin", "super_admin"])
