import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Types
export type BlogStatus = "draft" | "published" | "archived"
export type CommentStatus = "pending" | "published" | "rejected"

export interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  description?: string // Optional description for the blog post header
  excerpt?: string
  coverImage?: string
  thumbnail?: string
  author?: {
    id: string
    name: string
    email: string
  }
  authorId?: string
  authorName?: string
  authorAvatar?: string
  authorRole?: string // 'admin' or 'blogger' - to identify posts created by admin
  updatedById?: string
  updatedByName?: string
  updatedByAvatar?: string
  category?: string
  tags?: string[]
  featured?: boolean
  status: BlogStatus
  likes: number
  views: number
  shares: number
  commentsCount?: number
  readTime?: number
  likedBy?: string[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: string | ObjectId
  postId: string
  parentId?: string | null
  author: {
    name: string
    email: string
    userId?: string
  }
  content: string
  status: CommentStatus
  likes: number
  likedBy?: string[]
  createdAt: Date
  updatedAt: Date
}

// Blog Functions
export async function listPublishedBlogs(limit = 20, skip = 0) {
  const db = await getDb()
  
  const filter: Record<string, unknown> = { status: "published" }
  
  const total = await db.collection("blogs").countDocuments(filter)
  const blogs = await db.collection("blogs")
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  return {
    posts: blogs.map(b => ({ ...b, _id: b._id.toString() })),
    total,
  }
}

export async function listAllBlogs(limit = 50, skip = 0, status?: BlogStatus) {
  const db = await getDb()
  
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  
  const total = await db.collection("blogs").countDocuments(filter)
  const posts = await db.collection("blogs")
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  return {
    posts: posts.map(b => ({ ...b, _id: b._id.toString() })),
    total
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const db = await getDb()
  const blog = await db.collection("blogs").findOne({ slug })
  if (!blog) return null
  
  // Populate author data from users collection
  let authorAvatar: string | undefined
  let authorName = blog.authorName || "Admin"
  
  if (blog.authorId) {
    try {
      const author = await db.collection("users").findOne({ 
        _id: new ObjectId(blog.authorId) 
      })
      if (author) {
        authorName = author.name || authorName
        authorAvatar = author.avatar
      }
    } catch (e) {
      // If authorId is not a valid ObjectId, skip lookup
    }
  }
  
  // Populate updatedBy data from users collection
  let updatedByAvatar: string | undefined
  let updatedByName = blog.updatedByName
  
  if (blog.updatedById) {
    try {
      const updater = await db.collection("users").findOne({ 
        _id: new ObjectId(blog.updatedById) 
      })
      if (updater) {
        updatedByName = updater.name || updatedByName
        updatedByAvatar = updater.avatar
      }
    } catch (e) {
      // If updatedById is not a valid ObjectId, skip lookup
    }
  }
  
  return { 
    ...blog, 
    _id: blog._id.toString(),
    authorName,
    authorAvatar,
    updatedByName,
    updatedByAvatar
  } as Blog
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const db = await getDb()
  const blog = await db.collection("blogs").findOne({ _id: new ObjectId(id) })
  if (!blog) return null
  return { ...blog, _id: blog._id.toString() } as Blog
}

export async function incrementBlogViews(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne(   
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } }
  )
}

export async function createBlog(data: {
  title: string
  slug: string
  content: string
  description?: string
  excerpt?: string
  coverImage?: string
  thumbnail?: string
  author?: { id: string; name: string; email: string }
  authorId?: string
  authorName?: string
  authorRole?: string
  category?: string
  tags?: string[]
  featured?: boolean
  status: BlogStatus
  scheduledAt?: Date
  readTime?: number
}) {
  const db = await getDb()
  const now = new Date()
  
  const blog = {
    ...data,
    likes: 0,
    views: 0,
    shares: 0,
    likedBy: [],
    featured: data.featured || false,
    readTime: data.readTime,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? now : undefined,
  }
  
  const result = await db.collection("blogs").insertOne(blog)
  return { ...blog, _id: result.insertedId.toString() }
}

export async function updateBlog(id: string, data: Partial<Blog>, updatedBy?: { id: string; name: string }) {
  const db = await getDb()
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }
  
  // Track who updated the blog
  if (updatedBy) {
    updateData.updatedById = updatedBy.id
    updateData.updatedByName = updatedBy.name
  }
  
  if (data.status === "published") {
    const existing = await getBlogById(id)
    if (existing && existing.status !== "published") {
      updateData.publishedAt = new Date()
    }
  }
  
  await db.collection("blogs").updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  )
  
  return getBlogById(id)
}

export async function deleteBlog(id: string) {
  const db = await getDb()
  await db.collection("blogs").deleteOne({ _id: new ObjectId(id) })
  // Also delete associated comments
  await db.collection("comments").deleteMany({ postId: id })
  return true
}

export async function publishBlog(id: string, options?: { title?: string; excerpt?: string; tags?: string[]; featured?: boolean; scheduledAt?: Date; authorId?: string; authorName?: string }) {
  const updateData: Partial<Blog> = { status: "published" }
  if (options?.title !== undefined) updateData.title = options.title
  if (options?.excerpt !== undefined) updateData.excerpt = options.excerpt
  if (options?.tags !== undefined) updateData.tags = options.tags
  if (options?.featured !== undefined) updateData.featured = options.featured
  if (options?.authorId !== undefined) (updateData as Record<string, unknown>).authorId = options.authorId
  if (options?.authorName !== undefined) (updateData as Record<string, unknown>).authorName = options.authorName
  // scheduledAt can be used for future scheduling logic
  return updateBlog(id, updateData)
}

export async function unpublishBlog(id: string) {
  return updateBlog(id, { status: "draft" })
}

export async function incrementViews(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } }
  )
  return getBlogById(id)
}

export async function likeBlog(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { likes: 1 }
    }
  )
  return getBlogById(id)
}

export async function unlikeBlog(id: string) {
  const db = await getDb()
  await db.collection("blogs").updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { likes: -1 }
    }
  )
  return getBlogById(id)
}

// Comment Functions
export async function listPublishedCommentsByPost(postId: string, limit = 50, skip = 0) {
  const db = await getDb()
  
  const filter = { postId, status: "published", parentId: null }
  const comments = await db.collection("comments")
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  return comments.map(c => ({ ...c, _id: c._id.toString() }))
}

export async function listAllComments(limit = 50, skip = 0, status?: CommentStatus) {
  const db = await getDb()
  
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  
  const total = await db.collection("comments").countDocuments(filter)
  const comments = await db.collection("comments")
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  return {
    comments: comments.map(c => ({ ...c, _id: c._id.toString() })),
    total
  }
}

export async function getCommentById(id: string) {
  const db = await getDb()
  const comment = await db.collection("comments").findOne({ _id: new ObjectId(id) })
  if (!comment) return null
  return { ...comment, _id: comment._id.toString() }
}

export async function createComment(data: {
  postId: string
  postSlug?: string
  postTitle?: string
  parentId?: string | null
  author?: { name: string; email: string; userId?: string }
  authorName?: string
  subject?: string
  content: string
}) {
  const db = await getDb()
  const now = new Date()
  
  // Replies (when parentId is set) are auto-published; top-level comments need admin approval
  const status: CommentStatus = data.parentId ? "published" : "pending"

  const comment = {
    ...data,
    status,
    likes: 0,
    likedBy: [],
    createdAt: now,
    updatedAt: now,
  }
  
  const result = await db.collection("comments").insertOne(comment)
  return { ...comment, _id: result.insertedId.toString() }
}

export async function publishComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "published", updatedAt: new Date() } }
  )
  return getCommentById(id)
}

export async function unpublishComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "pending", updatedAt: new Date() } }
  )
  return getCommentById(id)
}

export async function deleteComment(id: string) {
  const db = await getDb()
  await db.collection("comments").deleteOne({ _id: new ObjectId(id) })
  // Also delete replies
  await db.collection("comments").deleteMany({ parentId: id })
  return true
}

export async function deleteMultipleComments(ids: string[]) {
  const db = await getDb()
  const objectIds = ids.map(id => new ObjectId(id))
  await db.collection("comments").deleteMany({ _id: { $in: objectIds } })
  // Also delete any replies to these comments
  await db.collection("comments").deleteMany({ parentId: { $in: ids } })
  return true
}

export async function likeComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { likes: 1 }
    }
  )
  return getCommentById(id)
}

export async function unlikeComment(id: string) {
  const db = await getDb()
  await db.collection("comments").updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { likes: -1 }
    }
  )
  return getCommentById(id)
}

export async function listPublishedRepliesByParentId(parentId: string, limit = 50, skip = 0) {
  const db = await getDb()
  
  const filter = { parentId, status: "published" }
  const replies = await db.collection("comments")
    .find(filter)
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  return replies.map(r => ({ ...r, _id: r._id.toString() }))
}
