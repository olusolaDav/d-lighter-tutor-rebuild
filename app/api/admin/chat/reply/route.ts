import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'

async function handler(request: AuthenticatedRequest) {
  try {
    const { sessionId, message } = await request.json()

    if (!sessionId || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'sessionId and message are required' }, { status: 400 })
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 })
    }

    await dbConnect()

    const session = await ChatSession.findOne({ sessionId })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }
    if (session.status === 'ended' || session.status === 'ai') {
      return NextResponse.json({ success: false, error: 'Session is not in live/waiting state' }, { status: 400 })
    }

    // Transition to live on first admin reply
    if (session.status === 'waiting') {
      session.status = 'live'
      const welcomeName = session.visitorName && session.visitorName !== 'Visitor'
        ? `, ${session.visitorName}`
        : ''
      session.messages.push({
        role: 'system',
        content: `🟢 A D-lighter support agent has joined the chat${welcomeName}! They can see your full conversation.`,
        timestamp: new Date(),
      })
    }

    session.messages.push({
      role: 'admin',
      content: message.trim(),
      timestamp: new Date(),
    })
    session.lastActivity = new Date()
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin chat reply error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send reply' }, { status: 500 })
  }
}

export const POST = withAuth(handler)
