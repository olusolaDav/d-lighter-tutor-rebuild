import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { sendWhatsAppMessage } from '@/lib/whatsappService'

// Generate a random 6-char session ID
function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // avoid ambiguous chars
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId: existingSessionId, visitorMessage, visitorPage, visitorName } = await request.json()

    if (!existingSessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 })
    }

    await dbConnect()

    // Find the existing AI session — or create one if it was never persisted (e.g. DB was down during AI chat)
    let session = await ChatSession.findOne({ sessionId: existingSessionId })
    if (!session) {
      session = await ChatSession.create({
        sessionId: existingSessionId,
        status: 'ai',
        visitorPage: visitorPage || '/',
        visitorName: visitorName || 'Visitor',
        messages: [],
        lastActivity: new Date(),
      })
    }

    // Update visitor name if provided
    if (visitorName && visitorName !== 'Visitor') {
      session.visitorName = visitorName
    }

    if (session.status === 'ended') {
      return NextResponse.json({ success: false, error: 'Session has ended' }, { status: 400 })
    }

    // Update status to waiting for admin
    session.status = 'waiting'
    session.lastActivity = new Date()

    // Add system message
    session.messages.push({
      role: 'system',
      content: 'Visitor has requested to chat with a human agent. Waiting for admin to join...',
      timestamp: new Date(),
    })

    if (visitorMessage) {
      session.messages.push({
        role: 'visitor',
        content: visitorMessage,
        timestamp: new Date(),
      })
    }

    await session.save()

    // Build WhatsApp notification for admin
    const adminPhone = process.env.WHATSAPP_NUMBER || ''
    const preview = visitorMessage
      ? `"${visitorMessage.slice(0, 120)}${visitorMessage.length > 120 ? '…' : ''}"`
      : '(no initial message)'

    // Build recent AI conversation summary (last 4 exchanges)
    const recentExchanges = session.messages
      .filter((m: { role: string }) => m.role === 'visitor' || m.role === 'ai')
      .slice(-8)
      .map((m: { role: string; content: string }) => `${m.role === 'visitor' ? '👤 Visitor' : '🤖 AI'}: ${m.content.slice(0, 100)}`)
      .join('\n')

    const whatsappMsg = `🔔 *D-lighter Tutor — New Live Chat*
━━━━━━━━━━━━━━
Session: *${session.sessionId}*
Visitor: *${session.visitorName || 'Visitor'}*
Page: ${session.visitorPage || '/'}
Time: ${new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos' })} (Lagos)

💬 *Visitor says:*
${preview}

${recentExchanges ? `📋 *Recent AI conversation:*\n${recentExchanges}\n` : ''}
━━━━━━━━━━━━━━
✅ *To reply to visitor:*
${session.sessionId}: your message here

🔴 *To end session:*
${session.sessionId}: END`

    if (adminPhone) {
      await sendWhatsAppMessage(adminPhone, whatsappMsg)
    }

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      message: 'Your request has been sent. An agent will join shortly.',
    })
  } catch (error) {
    console.error('Live chat start error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start live chat. Please try again.' },
      { status: 500 }
    )
  }
}
