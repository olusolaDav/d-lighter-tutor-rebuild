import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Lead from "@/lib/models/lead"
import TesterBooking from "@/lib/models/testerBooking"
import { TESTER_TIME_SLOTS, TESTER_TIMEZONE_LABEL } from "@/lib/constants/tester-schedule"
import { sendEmail } from "@/lib/email"

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
      testerDate, testerTime, testerAmPm, testerSlotKey, testerTimezone,
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

    const normalizedTesterTimezone = testerTimezone || TESTER_TIMEZONE_LABEL
    const derivedSlotKey = testerSlotKey ||
      TESTER_TIME_SLOTS.find((slot) => slot.label === testerTime)?.key ||
      ""

    if (!derivedSlotKey) {
      return NextResponse.json(
        { success: false, error: "Please select an available tester time slot" },
        { status: 400 }
      )
    }

    let reservedBooking: { _id: string } | null = null

    try {
      const createdBooking = await TesterBooking.create({
        dateKey: testerDate,
        slotKey: derivedSlotKey,
        slotLabel: testerTime,
        timezone: normalizedTesterTimezone,
        parentName,
        parentEmail,
        parentPhone,
        status: "booked",
      })
      reservedBooking = { _id: String(createdBooking._id) }
    } catch (bookingError: any) {
      if (bookingError?.code === 11000) {
        return NextResponse.json(
          { success: false, error: "This tester slot has just been taken. Please choose another time." },
          { status: 409 }
        )
      }
      throw bookingError
    }

    let lead
    try {
      lead = await Lead.create({
        parentName, parentEmail, parentPhone,
        parentCountry: resolvedParentCountry,
        learnerName, learnerEmail, learnerAge, learnerGrade, learnerSchool, learnerCountry,
        subjects: allSubjects, otherSubject,
        examType: resolvedExamType, otherExamType, examDate,
        gcseSubjects: gcseSubjects ?? [], otherGcseSubject,
        weakAreas, learningGoals,
        testerDate,
        testerTime,
        testerAmPm,
        testerSlotKey: derivedSlotKey,
        testerTimezone: normalizedTesterTimezone,
        testerBookingId: reservedBooking?._id,
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
    } catch (leadError) {
      if (reservedBooking?._id) {
        await TesterBooking.findByIdAndDelete(reservedBooking._id).catch(() => {})
      }
      throw leadError
    }

    if (reservedBooking?._id && lead?._id) {
      await TesterBooking.findByIdAndUpdate(reservedBooking._id, { leadId: lead._id }).catch(() => {})
    }

    const adminNotificationTo =
      process.env.LEADS_NOTIFICATION_EMAIL ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.CONTACT_EMAIL ||
      "hello@dlightertutor.com"

    const emailSubject = `New Enrolment Enquiry: ${learnerName} (${testerDate} ${testerTime})`
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#fff;color:#111827;">
        <h2 style="margin:0 0 16px;font-size:24px;">New Enrolment Enquiry</h2>
        <p style="margin:0 0 20px;color:#4b5563;">A new enquiry has been submitted with a reserved tester slot.</p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Lead ID</strong></td><td style="padding:8px 0;color:#111827;">${lead._id}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Parent</strong></td><td style="padding:8px 0;color:#111827;">${parentName} (${parentPhone})</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Parent Email</strong></td><td style="padding:8px 0;color:#111827;">${parentEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Learner</strong></td><td style="padding:8px 0;color:#111827;">${learnerName}, Age ${learnerAge}, ${learnerGrade}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Subjects</strong></td><td style="padding:8px 0;color:#111827;">${allSubjects.join(", ")}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;"><strong>Tester Slot</strong></td><td style="padding:8px 0;color:#111827;"><strong>${testerDate}</strong> · <strong>${testerTime}</strong> (${normalizedTesterTimezone})</td></tr>
          ${plan ? `<tr><td style="padding:8px 0;color:#6b7280;"><strong>Plan</strong></td><td style="padding:8px 0;color:#111827;">${plan}</td></tr>` : ""}
        </table>
        <p style="margin-top:20px;color:#4b5563;font-size:14px;">Review full details in Admin/Super Admin → Enrolment Enquiries.</p>
      </div>
    `.trim()

    const emailText = [
      "NEW ENROLMENT ENQUIRY",
      `Lead ID: ${lead._id}`,
      `Parent: ${parentName} (${parentPhone})`,
      `Parent Email: ${parentEmail}`,
      `Learner: ${learnerName}, Age ${learnerAge}, ${learnerGrade}`,
      `Subjects: ${allSubjects.join(", ")}`,
      `Tester Slot: ${testerDate} ${testerTime} (${normalizedTesterTimezone})`,
      plan ? `Plan: ${plan}` : "",
      "Review full details in Admin/Super Admin dashboard.",
    ].filter(Boolean).join("\n")

    await sendEmail({
      to: adminNotificationTo,
      subject: emailSubject,
      htmlContent: emailHtml,
      textContent: emailText,
    }).catch(() => {})

    // Keep WhatsApp text concise to avoid broken/too-long URLs on some browsers/devices.
    const whatsappNumber = (process.env.WHATSAPP_NUMBER || "2348129517392").replace(/\D/g, "")
    const whatsappMessage = [
      "NEW ENROLMENT ENQUIRY",
      `Lead ID: ${lead._id}`,
      `Parent: ${parentName} (${parentPhone})`,
      `Learner: ${learnerName}, Age ${learnerAge}, Grade ${learnerGrade}`,
      `Subjects: ${allSubjects.slice(0, 4).join(", ")}${allSubjects.length > 4 ? "..." : ""}`,
      `Tester: ${testerDate} ${testerTime} (${normalizedTesterTimezone})`,
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
