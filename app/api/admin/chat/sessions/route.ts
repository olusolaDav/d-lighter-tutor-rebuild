import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active' | 'all'

    const filter =
      status === 'all'
        ? {}
        : { status: { $in: ['waiting', 'live'] } }

    const sessions = await ChatSession.find(filter)
      .select('sessionId status visitorName visitorPhone visitorPage messages lastActivity createdAt')
      .sort({ lastActivity: -1 })
      .limit(100)
      .lean()

    const enriched = sessions.map((s) => {
      const msgs = (s.messages || []) as Array<{ role: string; content: string; timestamp: Date }>
      const lastMsg = msgs[msgs.length - 1]
      return {
        sessionId: s.sessionId,
        status: s.status,
        visitorName: s.visitorName,
        visitorPhone: s.visitorPhone,
        visitorPage: s.visitorPage,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
        messageCount: msgs.length,
        lastMessage: lastMsg
          ? { role: lastMsg.role, content: lastMsg.content.slice(0, 80), timestamp: lastMsg.timestamp }
          : null,
      }
    })

    return NextResponse.json({ success: true, sessions: enriched })
  } catch (error) {
    console.error('Admin chat sessions error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load sessions' }, { status: 500 })
  }
}

export const GET = withAuth(handler)
