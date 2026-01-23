import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  profileImage?: string;
  permissions: string[];
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
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    permissions: [{
      type: String,
      enum: [
        'read_dashboard',
        'manage_leads',
        'manage_bookings',
        'manage_content',
        'manage_users',
        'manage_admins',
        'system_settings'
      ]
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
  if (this.isNew) {
    if (this.role === 'super_admin') {
      this.permissions = [
        'read_dashboard',
        'manage_leads',
        'manage_bookings',
        'manage_content',
        'manage_users',
        'manage_admins',
        'system_settings'
      ];
    } else {
      this.permissions = [
        'read_dashboard',
        'manage_leads',
        'manage_bookings'
      ];
    }
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

// Limit to maximum 4 admins
adminSchema.pre('save', async function(next) {
  if (this.isNew) {
    const adminCount = await mongoose.model('Admin').countDocuments();
    if (adminCount >= 4) {
      const error = new Error('Maximum number of admin accounts (4) has been reached');
      return next(error);
    }
  }
  next();
});

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);