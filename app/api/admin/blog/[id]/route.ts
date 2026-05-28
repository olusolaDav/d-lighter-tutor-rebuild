import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { getBlogById, updateBlog, deleteBlog, publishBlog, unpublishBlog } from "@/lib/blog"
import slugify from "slugify"

interface Params {
  params: Promise<{ id: string }>
}

async function getHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    const post = await getBlogById(id)
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })
    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog/[id] GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function putHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    const admin = req.admin!
    const body = await req.json()

    const { title, content, thumbnail, tags, status, excerpt, description, featured } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      updateData.title = title
      updateData.slug = slugify(title, { lower: true, strict: true })
    }
    if (content !== undefined) {
      updateData.content = content
      // Recalculate read time
      const text = content.replace(/<[^>]+>/g, "")
      const words = text.trim().split(/\s+/).filter(Boolean).length
      updateData.readTime = Math.max(1, Math.ceil(words / 200))
      if (!excerpt) {
        updateData.excerpt = text.slice(0, 200)
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (description !== undefined) updateData.description = description
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail
    if (tags !== undefined) updateData.tags = tags
    if (status !== undefined) updateData.status = status
    if (featured !== undefined) updateData.featured = !!featured

    const post = await updateBlog(id, updateData as any, { id: admin.adminId, name: admin.email })
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog/[id] PUT error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function patchHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    const admin = req.admin!
    const body = await req.json()
    const { action, title, excerpt, tags, featured } = body

    let post
    if (action === "publish") {
      post = await publishBlog(id, { title, excerpt, tags, featured, authorId: admin.adminId, authorName: admin.email })
    } else if (action === "unpublish") {
      post = await unpublishBlog(id)
    } else {
      return NextResponse.json({ error: "invalid action" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog/[id] PATCH error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function deleteHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    await deleteBlog(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("/api/admin/blog/[id] DELETE error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export const GET = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => getHandler(r as AuthenticatedRequest, ctx))(req)
export const PUT = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => putHandler(r as AuthenticatedRequest, ctx))(req)
export const PATCH = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => patchHandler(r as AuthenticatedRequest, ctx))(req)
export const DELETE = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => deleteHandler(r as AuthenticatedRequest, ctx))(req)
