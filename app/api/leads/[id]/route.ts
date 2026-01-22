import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Lead from "@/lib/models/lead"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const lead = await Lead.findById(id)

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const lead = await Lead.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const lead = await Lead.findByIdAndDelete(id)

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    )
  }
}
