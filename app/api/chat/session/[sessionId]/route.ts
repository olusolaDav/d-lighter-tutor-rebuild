import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 })
    }

    await dbConnect()

    const session = await ChatSession.findOne({ sessionId })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    // Return full session state for the widget and admin dashboard to sync
    return NextResponse.json({
      success: true,
      status: session.status,
      visitorName: session.visitorName,
      visitorPhone: session.visitorPhone,
      messages: session.messages.map((m: { role: string; content: string; timestamp: Date }) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    })
  } catch (error) {
    console.error('Session poll error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}
