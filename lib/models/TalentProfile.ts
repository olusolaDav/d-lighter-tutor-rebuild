import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITalentProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title?: string;
  bio?: string;
  skills?: Array<{
    name: string;
    proficiency?: string;
    yearsOfExperience?: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  isActive: boolean;
  featured: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const talentProfileSchema = new Schema<ITalentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          proficiency: { type: String, default: '' },
          yearsOfExperience: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

talentProfileSchema.index({ status: 1, isActive: 1, featured: -1, createdAt: -1 });

const TalentProfile =
  mongoose.models.TalentProfile || mongoose.model<ITalentProfile>('TalentProfile', talentProfileSchema);

export default TalentProfile;