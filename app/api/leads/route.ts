import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Lead from "@/lib/models/lead"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      studentAge,
      subjects,
      gradeLevel,
      country,
      otherCountry,
      preferredDays,
      preferredTime,
      curriculum,
      plan,
      learningGoal,
      source = "sales-page",
    } = body

    // Compute the final country value
    const finalCountry = country === "Other" && otherCountry ? otherCountry : country

    // Validate required fields
    if (!name || !email || !phone || !studentAge || !subjects?.length || !gradeLevel || !country || !preferredDays?.length || !preferredTime || !curriculum) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate otherCountry if country is "Other"
    if (country === "Other" && !otherCountry) {
      return NextResponse.json(
        { success: false, error: "Please specify your country" },
        { status: 400 }
      )
    }

    // Create lead in database
    const lead = await Lead.create({
      name,
      email,
      phone,
      studentAge,
      subjects,
      gradeLevel,
      country: finalCountry,
      preferredDays,
      preferredTime,
      curriculum,
      plan,
      learningGoal,
      source,
      status: "new",
    })

    // Generate WhatsApp message
    const whatsappMessage = `
🎓 *NEW LEAD FROM SALES PAGE*

👤 *Parent Details:*
Name: ${name}
Email: ${email}
Phone: ${phone}
Country: ${finalCountry}

👨‍🎓 *Student Details:*
Age: ${studentAge}
Grade/Class: ${gradeLevel}
Subjects: ${subjects.join(", ")}
Curriculum: ${curriculum}
${plan ? `Plan: ${plan}` : ''}
${learningGoal ? `Learning Goal: ${learningGoal}` : ''}

📅 *Schedule Preferences:*
Days: ${preferredDays.join(", ")}
Time: ${preferredTime}

📊 Status: New Lead
🆔 Lead ID: ${lead._id}
`.trim()

    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/2348129517392?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      data: {
        leadId: lead._id,
        whatsappUrl,
      },
    })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit form. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")

    const query: Record<string, unknown> = {}
    if (status && status !== "all") {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        leads,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}
