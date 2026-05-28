import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true, strict: false }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

const Message = mongoose.models.Message || mongoose.model<IChatMessage>('Message', messageSchema);

export default Message;