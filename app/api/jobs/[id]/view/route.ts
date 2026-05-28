import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/lib/models/Job"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    const job = await Job.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean()

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Job view increment error:", error)
    return NextResponse.json({ success: false, error: "Failed to update view count" }, { status: 500 })
  }
}
