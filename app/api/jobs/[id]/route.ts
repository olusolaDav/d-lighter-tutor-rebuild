import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/lib/models/Job"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectDB()

    // Get authenticated user (optional for job viewing)
    const user = await getAuthUser(request)

    const job = await Job.findById(id).populate("postedBy", "firstName lastName email").lean()

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      job: job,
    })
  } catch (error) {
    console.error("Get job error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const job = await Job.findById(resolvedParams.id)
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Check if user owns this job or is admin
    const isOwner = job.postedBy.toString() === user.id
    const isAdmin = user.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: "Not authorized to edit this job" }, { status: 403 })
    }

    const updateData = await request.json()

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      resolvedParams.id,
      {
        ...updateData,
        // If not admin, reset approval status when editing
        ...(!isAdmin && isOwner && { isApproved: false }),
      },
      { new: true },
    ).populate("postedBy", "firstName lastName email")

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Check if user owns the job or is admin
    if (job.postedBy.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await Job.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
  } catch (error) {
    console.error("Delete job error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete job" }, { status: 500 })
  }
}
