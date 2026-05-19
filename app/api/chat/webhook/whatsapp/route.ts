import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'

/**
 * Green API Webhook — receives incoming WhatsApp messages from admin.
 *
 * Admin reply format:
 *   "ABC123: Hello visitor, here is your answer..."  → routes to session ABC123
 *   "ABC123: END"                                    → ends session ABC123
 *
 * Configure this webhook URL in your Green API dashboard:
 *   https://console.green-api.com → Instance Settings → Webhooks
 *   URL: https://your-domain.com/api/chat/webhook/whatsapp
 *   Enable: "Incoming messages" webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Accept both "sent from phone" (self-chat replies) and incoming messages.
    // When the server sends a notification to the admin's own number (self-chat),
    // the admin's reply comes back as 'outgoingMessageReceived' — NOT 'incomingMessageReceived'.
    // We also ignore messages sent via the API (outgoingAPIMessageReceived) to avoid loops.
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

    // Skip messages that look like our own API-sent notifications (they start with 🔔 or 👤)
    if (rawText.startsWith('🔔') || rawText.startsWith('👤')) {
      return NextResponse.json({ received: true })
    }

    await dbConnect()

    // ── Try to parse "SESSION_ID: message" prefix ──────────────────────────
    const match = rawText.match(/^([A-Za-z0-9]{4,8})\s*:\s*(.+)/s)
    const hasPrefix = match && /^[A-Z0-9]{5,7}$/.test(match[1].toUpperCase())

    let session = null
    let messageContent = rawText.trim()

    if (hasPrefix) {
      // Admin used the session prefix — route to that specific session
      const potentialSessionId = match![1].toUpperCase()
      messageContent = match![2].trim()
      session = await ChatSession.findOne({ sessionId: potentialSessionId })
      if (!session || session.status === 'ai') {
        return NextResponse.json({ received: true })
      }
    } else {
      // No prefix — route to the most recently active waiting/live session.
      // This lets admin just type naturally without remembering a session code.
      session = await ChatSession.findOne({
        status: { $in: ['waiting', 'live'] },
      }).sort({ lastActivity: -1 })

      if (!session) {
        // No active session to route to — ignore
        return NextResponse.json({ received: true })
      }
    }

    if (!messageContent) {
      return NextResponse.json({ received: true })
    }

    // Handle session end command ("END" or "SESSION_ID: END")
    if (messageContent.toUpperCase() === 'END') {
      session.status = 'ended'
      session.messages.push({
        role: 'system',
        content: 'The admin has ended this chat session. Thank you for chatting with us!',
        timestamp: new Date(),
      })
      session.lastActivity = new Date()
      await session.save()
      return NextResponse.json({ received: true })
    }

    // Admin is joining for the first time — mark as live and add a welcome system message
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

    // Store admin reply
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
    // Always return 200 to Green API to prevent retries
    return NextResponse.json({ received: true })
  }
}

// Green API also sends GET requests to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'd-lighter-chat-webhook' })
}
