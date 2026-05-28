import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'super_admin' | 'admin' | 'tutor' | 'student' | 'parent';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;          // unique login username for students (DLT-{name}{3digits})
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;               // for students
  password: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean; // true when account created by another user
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  profileImage?: string;
  permissions: string[];
  parentId?: Types.ObjectId;  // for student: links to parent user
  createdBy?: Types.ObjectId; // who created this account
  subjects?: string[];        // for tutors
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<any>;
  isLocked: boolean;
}

const adminSchema = new Schema<IAdmin>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // students may not have their own email
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,  // allow null/undefined (only students have usernames)
      trim: true,
      uppercase: true,
    },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    age: { type: Number, min: 1, max: 120 },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'tutor', 'student', 'parent'],
      default: 'admin',
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    profileImage: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    subjects: [{ type: String }],
    permissions: [{
      type: String,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function (this: IAdmin) {
  return !!(this.lockUntil && this.lockUntil instanceof Date && this.lockUntil.getTime() > Date.now());
});

// Middleware to hash password before saving
adminSchema.pre('save', async function (this: IAdmin, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Middleware to set default permissions
adminSchema.pre('save', function (this: IAdmin, next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    const rolePermissions: Record<string, string[]> = {
      super_admin: [
        'read_dashboard', 'manage_leads', 'manage_bookings',
        'manage_content', 'manage_users', 'manage_admins', 'system_settings',
      ],
      admin: ['read_dashboard', 'manage_leads', 'manage_bookings', 'manage_content', 'manage_users'],
      tutor: ['read_dashboard', 'view_sessions', 'manage_sessions'],
      student: ['read_dashboard', 'view_sessions', 'view_progress'],
      parent: ['read_dashboard', 'manage_children', 'view_sessions', 'manage_billing'],
    };
    this.permissions = rolePermissions[this.role] ?? ['read_dashboard'];
  }
  next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to increment login attempts
adminSchema.methods.incrementLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock the account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Index for performance
adminSchema.index({ isActive: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ parentId: 1 });

// In development, always use the latest schema (avoids stale cached model after edits)
if (process.env.NODE_ENV !== 'production' && mongoose.models.Admin) {
  delete (mongoose.models as any).Admin;
}

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);