import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJobApplication extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  applicantId: Types.ObjectId;
  personalInfo?: Record<string, any>;
  workExperience?: Array<Record<string, any>>;
  education?: Array<Record<string, any>>;
  skills?: Array<Record<string, any>>;
  certifications?: Array<Record<string, any>>;
  socialMedia?: Record<string, any>;
  documents?: Record<string, any>;
  application?: Record<string, any>;
  customAnswers?: Record<string, any>;
  consent?: Record<string, any>;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted' | 'hired';
  notes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    personalInfo: { type: Schema.Types.Mixed, default: {} },
    workExperience: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    skills: { type: [Schema.Types.Mixed], default: [] },
    certifications: { type: [Schema.Types.Mixed], default: [] },
    socialMedia: { type: Schema.Types.Mixed, default: {} },
    documents: { type: Schema.Types.Mixed, default: {} },
    application: { type: Schema.Types.Mixed, default: {} },
    customAnswers: { type: Schema.Types.Mixed, default: {} },
    consent: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'hired'], default: 'pending' },
    notes: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true, strict: false }
);

jobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
jobApplicationSchema.index({ status: 1, createdAt: -1 });

const JobApplication =
  mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

export default JobApplication;