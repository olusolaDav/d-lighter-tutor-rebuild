import { NextResponse } from "next/server"
import { getBlogBySlug, incrementViews } from "@/lib/blog"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const post = await getBlogBySlug(slug)
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 })

    const updated = await incrementViews(post._id as string)
    return NextResponse.json({ ok: true, views: updated?.views ?? (post.views ?? 0) + 1 })
  } catch (err) {
    console.error("/api/blog/[slug]/view POST error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
