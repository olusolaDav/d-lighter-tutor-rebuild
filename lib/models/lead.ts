import mongoose, { Schema, Document, Model } from "mongoose"

export interface ILead extends Document {
  // Step 1 — Parent
  parentName: string
  parentEmail: string
  parentPhone: string
  parentCountry: string
  // Step 1 — Learner
  learnerName: string
  learnerEmail: string
  learnerAge: string
  learnerGrade: string
  learnerSchool: string
  learnerCountry: string
  // Step 2 — Subjects
  subjects: string[]
  otherSubject?: string
  // Step 2 — Exam Prep
  examType: string
  otherExamType?: string
  examDate?: string
  gcseSubjects?: string[]
  otherGcseSubject?: string
  // Step 3 — Learning Needs
  weakAreas: string
  learningGoals: string
  // Step 3 — Tester Session
  testerDate: string
  testerTime: string
  testerAmPm: string
  testerTimezone?: string
  testerSlotKey?: string
  testerBookingId?: mongoose.Types.ObjectId
  // Step 3 — Schedule
  preferredDays: string[]
  preferredClassTime: string
  hoursPerWeek: string
  // Step 4 — Additional
  urgentNeeds: string
  specificResources: string
  additionalInfo: string
  // Step 4 — Referral
  referralSource: string
  otherReferralSource?: string
  // Meta
  plan?: string
  status: "new" | "contacted" | "converted" | "closed"
  notes: string
  source: string
  // Legacy fields (kept for backward compatibility)
  name?: string
  email?: string
  phone?: string
  studentAge?: string
  gradeLevel?: string
  country?: string
  preferredTime?: string
  curriculum?: string
  learningGoal?: string
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    // Step 1 — Parent
    parentName: { type: String, default: "" },
    parentEmail: { type: String, default: "" },
    parentPhone: { type: String, default: "" },
    parentCountry: { type: String, default: "" },
    // Step 1 — Learner
    learnerName: { type: String, default: "" },
    learnerEmail: { type: String, default: "" },
    learnerAge: { type: String, default: "" },
    learnerGrade: { type: String, default: "" },
    learnerSchool: { type: String, default: "" },
    learnerCountry: { type: String, default: "" },
    // Step 2 — Subjects
    subjects: [{ type: String }],
    otherSubject: { type: String, default: "" },
    // Step 2 — Exam Prep
    examType: { type: String, default: "" },
    otherExamType: { type: String, default: "" },
    examDate: { type: String, default: "" },
    gcseSubjects: [{ type: String }],
    otherGcseSubject: { type: String, default: "" },
    // Step 3 — Learning Needs
    weakAreas: { type: String, default: "" },
    learningGoals: { type: String, default: "" },
    // Step 3 — Tester Session
    testerDate: { type: String, default: "" },
    testerTime: { type: String, default: "" },
    testerAmPm: { type: String, default: "AM" },
    testerTimezone: { type: String, default: "West Africa Time (WAT)" },
    testerSlotKey: { type: String, default: "" },
    testerBookingId: { type: Schema.Types.ObjectId, ref: "TesterBooking" },
    // Step 3 — Schedule
    preferredDays: [{ type: String }],
    preferredClassTime: { type: String, default: "" },
    hoursPerWeek: { type: String, default: "" },
    // Step 4 — Additional
    urgentNeeds: { type: String, default: "" },
    specificResources: { type: String, default: "" },
    additionalInfo: { type: String, default: "" },
    // Step 4 — Referral
    referralSource: { type: String, default: "" },
    otherReferralSource: { type: String, default: "" },
    // Meta
    plan: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "closed"],
      default: "new",
    },
    notes: { type: String, default: "" },
    source: { type: String, default: "website" },
    // Legacy (backward compat)
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    studentAge: { type: String, default: "" },
    gradeLevel: { type: String, default: "" },
    country: { type: String, default: "" },
    preferredTime: { type: String, default: "" },
    curriculum: { type: String, default: "" },
    learningGoal: { type: String, default: "" },
  },
  { timestamps: true }
)

// Delete cached model so schema changes take effect after hot reload in dev
if (mongoose.models.Lead) {
  delete (mongoose.models as Record<string, unknown>).Lead
}
const Lead: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema)

export default Lead

