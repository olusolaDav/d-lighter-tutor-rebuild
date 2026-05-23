import { NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/middleware/auth"
import connectDB from "@/lib/mongodb"
import { Admin as AdminModel } from "@/lib/models/Admin"

async function handler(request: AuthenticatedRequest) {
  if (request.method !== "PATCH") {
    return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 })
  }
  if (!request.admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  try {
    await connectDB()
    const { enabled } = await request.json()
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid value" }, { status: 400 })
    }
    await AdminModel.findByIdAndUpdate(request.admin.adminId, { twoFactorEnabled: enabled })
    return NextResponse.json({
      success: true,
      message: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
    })
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export const PATCH = withAuth(handler)
