import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  isActive: boolean;
  unreadCount: Map<string, number>;
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    isActive: { type: Boolean, default: true },
    unreadCount: { type: Map, of: Number, default: {} },
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
  },
  { timestamps: true, strict: false }
);

conversationSchema.index({ participants: 1, isActive: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;