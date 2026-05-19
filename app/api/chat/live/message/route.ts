import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { sendWhatsAppMessage } from '@/lib/whatsappService'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json()

    if (!sessionId || !message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Session ID and message required' }, { status: 400 })
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 })
    }

    await dbConnect()

    const session = await ChatSession.findOne({ sessionId })
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    if (session.status === 'ended') {
      return NextResponse.json({ success: false, error: 'This chat session has ended' }, { status: 400 })
    }

    // Store visitor message
    session.messages.push({
      role: 'visitor',
      content: message.trim(),
      timestamp: new Date(),
    })
    session.lastActivity = new Date()
    await session.save()

    // Forward visitor message to admin via WhatsApp, clearly labelled with visitor identity
    const adminPhone = process.env.WHATSAPP_NUMBER || ''
    if (adminPhone && (session.status === 'live' || session.status === 'waiting')) {
      const nameLabel = session.visitorName && session.visitorName !== 'Visitor'
        ? session.visitorName
        : 'Visitor'
      const phoneLabel = session.visitorPhone ? ` | ${session.visitorPhone}` : ''
      // Pre-filled reply link — tapping opens WhatsApp with "SESSION_ID: " ready to type
      const replyText = encodeURIComponent(`${sessionId}: `)
      const replyLink = `https://wa.me/${adminPhone}?text=${replyText}`
      const whatsappMsg = `👤 *${nameLabel}${phoneLabel}*\n🆔 Session: *${sessionId}*\n\n${message.trim()}\n\n💬 _Tap to reply:_ ${replyLink}`
      await sendWhatsAppMessage(adminPhone, whatsappMsg)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Live chat message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
