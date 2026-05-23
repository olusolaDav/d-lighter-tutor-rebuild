import { NextResponse } from "next/server"
import { listPublishedBlogs } from "@/lib/blog"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 20)
    const skip = Number(url.searchParams.get("skip") || 0)
    const tag = url.searchParams.get("tag") || undefined
    const category = url.searchParams.get("category") || undefined
    const result = await listPublishedBlogs(limit, skip)
    let posts = result.posts

    // Client-side filtering by tag or category
    if (tag) posts = posts.filter((p: any) => p.tags?.includes(tag))
    if (category) posts = posts.filter((p: any) => p.category === category || p.tags?.includes(category))

    return NextResponse.json({ ok: true, posts, total: result.total })
  } catch (err) {
    console.error("/api/blog GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
