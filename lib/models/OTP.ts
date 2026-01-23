import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOTP extends Document {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  purpose: 'email_verification' | 'login_verification' | 'password_reset';
  attempts: number;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      length: [6, 'OTP must be exactly 6 digits'],
    },
    purpose: {
      type: String,
      required: [true, 'OTP purpose is required'],
      enum: ['email_verification', 'login_verification', 'password_reset'],
    },
    attempts: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 attempts allowed'],
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance and auto-deletion
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Prevent multiple active OTPs for same email and purpose
otpSchema.index(
  { email: 1, purpose: 1, isUsed: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isUsed: false }
  }
);

export const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);