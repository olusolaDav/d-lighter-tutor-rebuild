import mongoose, { Schema, Document, Model } from "mongoose"

export interface ILead extends Document {
  name: string
  email: string
  phone: string
  studentAge: string
  subjects: string[]
  gradeLevel: string
  country: string
  preferredDays: string[]
  preferredTime: string
  curriculum: string
  plan?: string
  learningGoal?: string
  status: "new" | "contacted" | "converted" | "closed"
  notes: string
  source: string
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    studentAge: { type: String, required: true },
    subjects: [{ type: String, required: true }],
    gradeLevel: { type: String, required: true },
    country: { type: String, required: true },
    preferredDays: [{ type: String, required: true }],
    preferredTime: { type: String, required: true },
    curriculum: { type: String, required: true },
    plan: { type: String, default: "" },
    learningGoal: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["new", "contacted", "converted", "closed"],
      default: "new" 
    },
    notes: { type: String, default: "" },
    source: { type: String, default: "sales-page" },
  },
  { timestamps: true }
)

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema)

export default Lead
