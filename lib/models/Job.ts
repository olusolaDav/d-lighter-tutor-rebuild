import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  company?: {
    name?: string;
    [key: string]: any;
  };
  employerInfo?: Record<string, any>;
  applicationMethod?: Record<string, any>;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  location?: Record<string, any>;
  salary?: Record<string, any>;
  jobType?: string;
  internshipType?: string;
  experience?: string;
  experienceLevel?: string;
  applicationDeadline?: Date;
  featured: boolean;
  postedBy?: Types.ObjectId;
  isActive: boolean;
  isApproved: boolean;
  views: number;
  applicants?: Array<Record<string, any>>;
  ratings?: Array<Record<string, any>>;
  averageRating?: number;
  totalRatings?: number;
  reports?: Array<Record<string, any>>;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: Schema.Types.Mixed, default: {} },
    employerInfo: { type: Schema.Types.Mixed, default: {} },
    applicationMethod: { type: Schema.Types.Mixed, default: {} },
    description: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    location: { type: Schema.Types.Mixed, default: {} },
    salary: { type: Schema.Types.Mixed, default: {} },
    jobType: { type: String, default: '' },
    internshipType: { type: String, default: '' },
    experience: { type: String, default: '' },
    experienceLevel: { type: String, default: '' },
    applicationDeadline: { type: Date },
    featured: { type: Boolean, default: false },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    applicants: { type: [Schema.Types.Mixed], default: [] },
    ratings: { type: [Schema.Types.Mixed], default: [] },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reports: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, strict: false }
);

jobSchema.index({ featured: -1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;