import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { listAllComments, publishComment, unpublishComment, deleteComment, deleteMultipleComments } from "@/lib/blog"

async function getHandler(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || 100)
    const skip = Number(url.searchParams.get("skip") || 0)
    const status = url.searchParams.get("status") as "pending" | "published" | "rejected" | undefined

    const result = await listAllComments(limit, skip, status)
    return NextResponse.json({ ok: true, comments: result.comments, total: result.total })
  } catch (err) {
    console.error("/api/admin/blog/comments GET error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function patchHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { id, ids, action } = body

    if (action === "publish" && id) {
      const comment = await publishComment(id)
      return NextResponse.json({ ok: true, comment })
    } else if (action === "unpublish" && id) {
      const comment = await unpublishComment(id)
      return NextResponse.json({ ok: true, comment })
    } else if (action === "delete" && id) {
      await deleteComment(id)
      return NextResponse.json({ ok: true })
    } else if (action === "delete-bulk" && Array.isArray(ids) && ids.length > 0) {
      await deleteMultipleComments(ids)
      return NextResponse.json({ ok: true })
    } else {
      return NextResponse.json({ error: "invalid action or missing id" }, { status: 400 })
    }
  } catch (err) {
    console.error("/api/admin/blog/comments PATCH error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const PATCH = withAuth(patchHandler)
