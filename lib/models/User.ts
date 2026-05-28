import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'super_admin' | 'admin' | 'tutor' | 'student' | 'parent' | 'user';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  hasApplied?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    email: { type: String, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['super_admin', 'admin', 'tutor', 'student', 'parent', 'user'], default: 'user' },
    avatar: { type: String, default: '' },
    phone: { type: String, trim: true, default: '' },
    hasApplied: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { unique: true, sparse: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema, 'users');

export default User;