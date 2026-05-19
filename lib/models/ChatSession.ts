import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage {
  role: 'visitor' | 'admin' | 'ai' | 'system'
  content: string
  timestamp: Date
}

export interface IChatSession extends Document {
  sessionId: string
  status: 'ai' | 'waiting' | 'live' | 'ended'
  visitorPage: string
  visitorName: string
  visitorPhone: string
  agentName: string
  messages: IMessage[]
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['visitor', 'admin', 'ai', 'system'],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
})

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['ai', 'waiting', 'live', 'ended'],
      default: 'ai',
    },
    visitorPage: { type: String, default: '/' },
    visitorName: { type: String, default: 'Visitor' },
    visitorPhone: { type: String, default: '' },
    agentName: { type: String, default: '' },
    messages: [MessageSchema],
    lastActivity: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

// Auto-expire sessions after 24 hours of inactivity
ChatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 })

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>('ChatSession', ChatSessionSchema)

export default ChatSession
