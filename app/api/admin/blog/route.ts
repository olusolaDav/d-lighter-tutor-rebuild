import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { listAllBlogs, createBlog } from "@/lib/blog"
import slugify from "slugify"

async function getHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 100)
    const skip = Number(url.searchParams.get("skip") || 0)
    const status = url.searchParams.get("status") as "draft" | "published" | "archived" | undefined

    const result = await listAllBlogs(limit, skip, status)
    return NextResponse.json({ ok: true, posts: result.posts, total: result.total })
  } catch (err) {
    console.error("/api/admin/blog GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const admin = req.admin!
    const body = await req.json()

    const { title, content, thumbnail, tags, status = "draft", excerpt, description, featured = false } = body

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 })
    }

    const slug = slugify(title, { lower: true, strict: true })

    // Calculate read time
    const text = content.replace(/<[^>]+>/g, "")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const readTime = Math.max(1, Math.ceil(words / 200))

    const post = await createBlog({
      title,
      slug,
      content,
      excerpt: excerpt || text.slice(0, 200),
      description,
      thumbnail,
      tags: tags || [],
      featured: !!featured,
      status,
      readTime,
      authorId: admin.adminId,
      authorName: `${admin.email}`,
      authorRole: "admin",
    })

    return NextResponse.json({ ok: true, post })
  } catch (err) {
    console.error("/api/admin/blog POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
