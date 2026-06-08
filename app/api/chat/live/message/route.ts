import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { Admin } from '@/lib/models/Admin'
import { sendWhatsAppMessage } from '@/lib/whatsappService'
import { emailService } from '@/lib/emailService'

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

    const nameLabel = session.visitorName && session.visitorName !== 'Visitor'
      ? session.visitorName
      : 'Visitor'

    // Forward visitor message to admin via WhatsApp — only message body + dashboard link
    const adminPhone = process.env.WHATSAPP_NUMBER || ''
    if (adminPhone && (session.status === 'live' || session.status === 'waiting')) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://d-lightertutor.com'
      const dashboardLink = `${baseUrl}/admin/chat?session=${sessionId}`
      const phoneLabel = session.visitorPhone ? ` | ${session.visitorPhone}` : ''
      const whatsappMsg = `👤 *${nameLabel}${phoneLabel}*
🆔 *${sessionId}*

${message.trim()}

🖥️ Reply on dashboard: ${dashboardLink}`
      await sendWhatsAppMessage(adminPhone, whatsappMsg)
    }

    // Email all active admin/super_admin users
    if (session.status === 'live' || session.status === 'waiting') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://d-lightertutor.com'
      const dashboardUrl = `${baseUrl}/admin/chat?session=${sessionId}`

      const admins = await Admin.find(
        { role: { $in: ['admin', 'super_admin'] }, isActive: true },
        { email: 1, firstName: 1, lastName: 1 }
      ).lean()

      // Fire all emails in parallel; failures are non-fatal
      await Promise.allSettled(
        admins.map((admin: any) =>
          emailService.sendChatMessageNotification({
            adminEmail: admin.email,
            adminName: `${admin.firstName} ${admin.lastName}`,
            visitorName: nameLabel,
            visitorPhone: session.visitorPhone || undefined,
            sessionId,
            message: message.trim(),
            dashboardUrl,
          })
        )
      )
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
