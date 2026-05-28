import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPosition extends Document {
  _id: Types.ObjectId;
  title: string;
  type: 'tutor' | 'other'; // 'tutor' = the primary featured role shown prominently on /careers
  description: string;
  requirements: string[];
  responsibilities: string[];
  subjects: string[];        // subjects the tutor/candidate will handle
  qualifications: string[];
  benefits: string[];
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  compensation: {
    type: 'hourly' | 'monthly' | 'stipend' | 'negotiable';
    min?: number;
    max?: number;
    currency: string;
  };
  employmentType: 'full-time' | 'part-time' | 'freelance' | 'contract';
  applicationDeadline?: Date;
  assessmentLink?: string;  // Shown to applicant on success — link to assessment test
  isActive: boolean;
  isApproved: boolean;
  featured: boolean;
  views: number;
  postedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema<IPosition>(
  {
    title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: ['tutor', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      required: [true, 'Position description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    subjects: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        default: 'remote',
      },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    compensation: {
      type: {
        type: String,
        enum: ['hourly', 'monthly', 'stipend', 'negotiable'],
        default: 'negotiable',
      },
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'NGN' },
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'contract'],
      default: 'part-time',
    },
    applicationDeadline: {
      type: Date,
    },
    assessmentLink: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
positionSchema.index({ type: 1, isActive: 1, isApproved: 1 });
positionSchema.index({ featured: -1, createdAt: -1 });
positionSchema.index({ title: 'text', description: 'text' });

const Position =
  mongoose.models.Position ||
  mongoose.model<IPosition>('Position', positionSchema);

export default Position;
