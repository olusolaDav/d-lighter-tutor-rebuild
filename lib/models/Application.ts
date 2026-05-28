import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IApplication extends Document {
  _id: Types.ObjectId;
  positionId: Types.ObjectId;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city?: string;
    country?: string;
  };
  // Subjects the applicant can teach (for tutor roles)
  subjects: string[];
  teachingExperience: {
    hasExperience: boolean;
    yearsOfExperience?: number;
    description?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    isOngoing: boolean;
  }>;
  resume: {
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    publicId: string;
    resourceType: string;
    format?: string;
  };
  availability: {
    type: 'weekdays' | 'weekends' | 'both' | 'flexible';
    schedules: Array<{
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      startTime: string;
      endTime: string;
    }>;
  };
  whyJoin: string;    // Motivation / cover letter
  additionalInfo?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes?: string;    // Internal admin notes
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    positionId: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: [true, 'Position reference is required'],
    },
    personalInfo: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    subjects: {
      type: [String],
      default: [],
    },
    teachingExperience: {
      hasExperience: {
        type: Boolean,
        default: false,
      },
      yearsOfExperience: {
        type: Number,
        min: 0,
      },
      description: {
        type: String,
      },
    },
    education: [
      {
        institution: { type: String, required: true, trim: true },
        degree: { type: String, required: true, trim: true },
        fieldOfStudy: { type: String, trim: true },
        startYear: { type: Number },
        endYear: { type: Number },
        isOngoing: { type: Boolean, default: false },
      },
    ],
    resume: {
      fileName: {
        type: String,
        required: [true, 'Resume file name is required'],
        trim: true,
      },
      fileType: {
        type: String,
        required: [true, 'Resume file type is required'],
        trim: true,
      },
      fileSize: {
        type: Number,
        required: [true, 'Resume file size is required'],
        min: 1,
      },
      url: {
        type: String,
        required: [true, 'Resume URL is required'],
      },
      publicId: {
        type: String,
        required: [true, 'Resume public ID is required'],
      },
      resourceType: {
        type: String,
        required: [true, 'Resume resource type is required'],
      },
      format: {
        type: String,
      },
    },
    availability: {
      type: {
        type: String,
        enum: ['weekdays', 'weekends', 'both', 'flexible'],
        default: 'flexible',
      },
      schedules: [
        {
          day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true,
          },
          startTime: { type: String, required: true, trim: true },
          endTime: { type: String, required: true, trim: true },
        },
      ],
    },
    whyJoin: {
      type: String,
      required: [true, 'Please tell us why you want to join'],
    },
    additionalInfo: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
applicationSchema.index({ positionId: 1, status: 1 });
applicationSchema.index({ 'personalInfo.email': 1, positionId: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });

// In Next.js dev with HMR, a previously compiled model can keep an outdated schema.
// Re-register the model in development so newly added fields are persisted.
if (process.env.NODE_ENV === 'development' && mongoose.models.Application) {
  delete mongoose.models.Application;
}

const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
