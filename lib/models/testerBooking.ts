import mongoose, { Document, Model, Schema } from "mongoose"

export interface ITesterBooking extends Document {
  dateKey: string
  slotKey: string
  slotLabel: string
  timezone: string
  leadId?: mongoose.Types.ObjectId
  parentName: string
  parentEmail: string
  parentPhone: string
  status: "booked"
  createdAt: Date
  updatedAt: Date
}

const TesterBookingSchema = new Schema<ITesterBooking>(
  {
    dateKey: { type: String, required: true },
    slotKey: { type: String, required: true },
    slotLabel: { type: String, required: true },
    timezone: { type: String, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked"],
      default: "booked",
    },
  },
  { timestamps: true }
)

TesterBookingSchema.index({ dateKey: 1, slotKey: 1 }, { unique: true })
TesterBookingSchema.index({ dateKey: 1 })

if (mongoose.models.TesterBooking) {
  delete (mongoose.models as Record<string, unknown>).TesterBooking
}

const TesterBooking: Model<ITesterBooking> = mongoose.model<ITesterBooking>("TesterBooking", TesterBookingSchema)

export default TesterBooking
