import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import JobApplication from "@/lib/models/JobApplication"
import Job from "@/lib/models/Job"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""

    // Verify job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Build query
    const query: any = { jobId }

    if (status && status !== "all") {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      JobApplication.find(query)
        .populate("applicantId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments(query),
    ])

    // Get application stats for this job
    const statsAggregation = await JobApplication.aggregate([
      { $match: { jobId: job._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    }

    statsAggregation.forEach((stat) => {
      stats[stat._id as keyof typeof stats] = stat.count
      stats.total += stat.count
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
        },
        applications,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Job applications API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch job applications" }, { status: 500 })
  }
}
  