import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")
    const tagsParam = searchParams.get("tags")
    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : []

    const db = await getDb()

    // Find published posts sharing at least one tag, excluding the current post
    const filter: Record<string, unknown> = { status: "published" }
    if (postId) {
      // Exclude current post by _id string match via $where is slow; use string comparison via $expr
      const { ObjectId } = await import("mongodb")
      try {
        filter._id = { $ne: new ObjectId(postId) }
      } catch {
        // postId is not a valid ObjectId — just skip the exclusion
      }
    }
    if (tags.length > 0) {
      filter.tags = { $in: tags }
    }

    const posts = await db
      .collection("blogs")
      .find(filter)
      .sort({ publishedAt: -1 })
      .limit(6)
      .project({
        title: 1,
        slug: 1,
        excerpt: 1,
        thumbnail: 1,
        publishedAt: 1,
        createdAt: 1,
        readTime: 1,
        tags: 1,
      })
      .toArray()

    const result = posts.map((p) => ({ ...p, _id: p._id.toString() }))
    return NextResponse.json(result)
  } catch (err) {
    console.error("/api/blog/related GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
