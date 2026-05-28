import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TalentProfile from "@/lib/models/TalentProfile"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { isActive } = await request.json()

    const { id } = await params

    const profile = await TalentProfile.findById(id)
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    profile.isActive = isActive
    await profile.save()
    await profile.populate("userId", "firstName lastName email")

    return NextResponse.json({
      success: true,
      data: profile,
      message: `Profile ${isActive ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("Profile status toggle error:", error)
    return NextResponse.json({ success: false, error: "Failed to update profile status" }, { status: 500 })
  }
}
