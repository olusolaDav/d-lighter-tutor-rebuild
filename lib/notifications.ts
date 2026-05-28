import mongoose, { Schema, Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const NotificationModel =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export async function notify(payload: NotificationPayload) {
  await connectDB();
  return NotificationModel.create({
    userId: new Types.ObjectId(payload.userId),
    type: payload.type,
    title: payload.title,
    message: payload.message,
    link: payload.link ?? '',
    metadata: payload.metadata ?? {},
  });
}

export async function notifyRole(payload: NotificationPayload & { role: string }) {
  await connectDB();

  const recipients = await User.find({ role: payload.role }).select('_id').lean();
  if (recipients.length === 0) {
    return [];
  }

  return NotificationModel.insertMany(
    recipients.map((recipient) => ({
      userId: recipient._id,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? '',
      metadata: payload.metadata ?? {},
    }))
  );
}