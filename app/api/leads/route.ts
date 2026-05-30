import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Lead from "@/lib/models/lead"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    const {
      // Step 1 — Parent
      parentName, parentEmail, parentPhone, parentCountry, parentOtherCountry,
      // Step 1 — Learner
      learnerName, learnerEmail, learnerAge, learnerGrade, learnerSchool, learnerCountry,
      // Step 2 — Subjects
      subjects, otherSubject,
      // Step 2 — Exam
      examType, otherExamType, examDate, gcseSubjects, otherGcseSubject,
      // Step 3 — Learning needs
      weakAreas, learningGoals,
      // Step 3 — Tester session
      testerDate, testerTime, testerAmPm,
      // Step 3 — Schedule
      preferredDays, preferredClassTime, hoursPerWeek,
      // Step 4
      urgentNeeds, specificResources, additionalInfo,
      referralSource, otherReferralSource,
      // Meta
      plan,
      source = "website",
    } = body

    // Validate required fields
    if (
      !parentName || !parentEmail || !parentPhone || !parentCountry ||
      !learnerName || !learnerEmail || !learnerAge || !learnerGrade || !learnerSchool || !learnerCountry ||
      !subjects?.length || !examType ||
      !weakAreas || !learningGoals || !testerDate || !testerTime ||
      !preferredDays?.length || !preferredClassTime || !hoursPerWeek ||
      !urgentNeeds || !specificResources || !additionalInfo || !referralSource
    ) {
      return NextResponse.json(
        { success: false, error: "Please complete all required fields" },
        { status: 400 }
      )
    }

    const resolvedParentCountry = parentCountry === "Other" && parentOtherCountry
      ? parentOtherCountry
      : parentCountry

    const allSubjects = otherSubject
      ? [...subjects, `Other: ${otherSubject}`]
      : subjects

    const resolvedExamType = examType === "Other" && otherExamType
      ? `Other: ${otherExamType}`
      : examType

    const lead = await Lead.create({
      parentName, parentEmail, parentPhone,
      parentCountry: resolvedParentCountry,
      learnerName, learnerEmail, learnerAge, learnerGrade, learnerSchool, learnerCountry,
      subjects: allSubjects, otherSubject,
      examType: resolvedExamType, otherExamType, examDate,
      gcseSubjects: gcseSubjects ?? [], otherGcseSubject,
      weakAreas, learningGoals,
      testerDate, testerTime, testerAmPm,
      preferredDays, preferredClassTime, hoursPerWeek,
      urgentNeeds, specificResources, additionalInfo,
      referralSource: referralSource === "Other" && otherReferralSource
        ? `Other: ${otherReferralSource}`
        : referralSource,
      otherReferralSource,
      plan,
      source,
      status: "new",
      // Legacy aliases so existing dashboard views still work
      name: parentName,
      email: parentEmail,
      phone: parentPhone,
      country: resolvedParentCountry,
      studentAge: learnerAge,
      gradeLevel: learnerGrade,
    })

    // Keep WhatsApp text concise to avoid broken/too-long URLs on some browsers/devices.
    const whatsappNumber = (process.env.WHATSAPP_NUMBER || "2348129517392").replace(/\D/g, "")
    const whatsappMessage = [
      "NEW ENROLMENT ENQUIRY",
      `Lead ID: ${lead._id}`,
      `Parent: ${parentName} (${parentPhone})`,
      `Learner: ${learnerName}, Age ${learnerAge}, Grade ${learnerGrade}`,
      `Subjects: ${allSubjects.slice(0, 4).join(", ")}${allSubjects.length > 4 ? "..." : ""}`,
      `Tester: ${testerDate} ${testerTime} ${testerAmPm || ""}`.trim(),
      plan ? `Plan: ${plan}` : "",
      "Please check full details in Admin Leads dashboard.",
    ].filter(Boolean).join("\n")

    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      data: { leadId: lead._id, whatsappUrl },
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
