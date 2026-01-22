import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Lead from "@/lib/models/lead"

export async function GET() {
  try {
    await dbConnect()

    const [total, newLeads, contacted, converted, closed, todayLeads, weekLeads] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "contacted" }),
      Lead.countDocuments({ status: "converted" }),
      Lead.countDocuments({ status: "closed" }),
      Lead.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Lead.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ])

    // Get leads by country
    const byCountry = await Lead.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    // Get leads by subject
    const bySubject = await Lead.aggregate([
      { $unwind: "$subjects" },
      { $group: { _id: "$subjects", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus: { new: newLeads, contacted, converted, closed },
        todayLeads,
        weekLeads,
        byCountry,
        bySubject,
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
