import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import { publishComment, unpublishComment, deleteComment, deleteMultipleComments } from "@/lib/blog"

interface Params {
  params: Promise<{ id: string }>
}

async function patchHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (action === "publish") {
      const comment = await publishComment(id)
      return NextResponse.json({ ok: true, comment })
    } else if (action === "unpublish") {
      const comment = await unpublishComment(id)
      return NextResponse.json({ ok: true, comment })
    } else {
      return NextResponse.json({ error: "invalid action" }, { status: 400 })
    }
  } catch (err) {
    console.error("/api/admin/blog/comments/[id] PATCH error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

async function deleteHandler(req: AuthenticatedRequest, { params }: Params) {
  try {
    const { id } = await params
    await deleteComment(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("/api/admin/blog/comments/[id] DELETE error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export const PATCH = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => patchHandler(r as AuthenticatedRequest, ctx))(req)
export const DELETE = (req: AuthenticatedRequest, ctx: Params) => withAuth((r) => deleteHandler(r as AuthenticatedRequest, ctx))(req)
