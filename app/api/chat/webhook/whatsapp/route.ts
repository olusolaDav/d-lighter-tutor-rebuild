import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { sendWhatsAppMessage } from '@/lib/whatsappService'

/**
 * Green API Webhook — receives WhatsApp replies from admin and routes them
 * to the correct visitor chat session.
 *
 * Multi-session routing rules:
 *   1 active session  → admin can type freely, auto-routed
 *   2+ active sessions → admin must prefix: "ABC123: your message"
 *                         if no prefix, admin receives a reminder listing all sessions
 *
 * End a session: "ABC123: END"  (or just "END" when only 1 session is active)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Accept replies typed from phone (outgoingMessageReceived = self-chat reply)
    // and standard incoming messages. API-sent messages (outgoingAPIMessageReceived)
    // are excluded to prevent feedback loops.
    const allowedTypes = ['incomingMessageReceived', 'outgoingMessageReceived']
    if (!allowedTypes.includes(body.typeWebhook)) {
      return NextResponse.json({ received: true })
    }

    const messageData = body.messageData
    if (!messageData || messageData.typeMessage !== 'textMessage') {
      return NextResponse.json({ received: true })
    }

    const rawText: string = messageData.textMessageData?.textMessage || ''
    if (!rawText.trim()) return NextResponse.json({ received: true })

    // Skip our own API-sent notifications to avoid echo loops
    if (
      rawText.startsWith('🔔') ||
      rawText.startsWith('👤') ||
      rawText.startsWith('⚠️') ||
      rawText.startsWith('📋')
    ) {
      return NextResponse.json({ received: true })
    }

    await dbConnect()

    // ── Fetch all currently active sessions ─────────────────────────────────
    const activeSessions = await ChatSession.find({
      status: { $in: ['waiting', 'live'] },
    }).sort({ lastActivity: -1 })

    if (activeSessions.length === 0) {
      return NextResponse.json({ received: true })
    }

    // ── Parse optional "SESSION_ID: message" prefix ─────────────────────────
    const prefixMatch = rawText.match(/^([A-Za-z0-9]{4,8})\s*:\s*(.+)/s)
    const prefixId = prefixMatch && /^[A-Z0-9]{5,7}$/.test(prefixMatch[1].toUpperCase())
      ? prefixMatch[1].toUpperCase()
      : null

    let session: (typeof activeSessions)[0] | null = null
    let messageContent = rawText.trim()

    if (prefixId) {
      // Admin specified a session — find it
      session = activeSessions.find(s => s.sessionId === prefixId) ?? null
      if (!session) {
        return NextResponse.json({ received: true }) // unknown session ID
      }
      messageContent = prefixMatch![2].trim()
    } else if (activeSessions.length === 1) {
      // Only one active session — auto-route, no prefix needed
      session = activeSessions[0]
    } else {
      // Multiple active sessions and no prefix — send admin a reminder
      const adminPhone = process.env.WHATSAPP_NUMBER || ''
      if (adminPhone) {
        const list = activeSessions
          .map(
            (s, i) =>
              `${i + 1}. *${s.sessionId}* — ${s.visitorName || 'Visitor'}${s.visitorPhone ? ` (${s.visitorPhone})` : ''} [${s.status}]\n   Reply: *${s.sessionId}: your message*\n   End:   *${s.sessionId}: END*`
          )
          .join('\n\n')

        await sendWhatsAppMessage(
          adminPhone,
          `⚠️ *${activeSessions.length} active chats — which one did you mean?*\n\nPrefix your message with the session ID:\n\n${list}\n\nYour message was:\n"${rawText.slice(0, 200)}"`
        )
      }
      return NextResponse.json({ received: true })
    }

    if (!messageContent) return NextResponse.json({ received: true })

    // ── Handle END command ──────────────────────────────────────────────────
    if (messageContent.toUpperCase() === 'END') {
      session.status = 'ended'
      session.messages.push({
        role: 'system',
        content: 'The support agent has ended this chat. Thank you for chatting with D-lighter Tutor!',
        timestamp: new Date(),
      })
      session.lastActivity = new Date()
      await session.save()
      return NextResponse.json({ received: true })
    }

    // ── Admin joins for the first time ──────────────────────────────────────
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

    // ── Store admin reply ───────────────────────────────────────────────────
    session.messages.push({
      role: 'admin',
      content: messageContent,
      timestamp: new Date(),
    })
    session.lastActivity = new Date()
    await session.save()

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'd-lighter-chat-webhook' })
}
