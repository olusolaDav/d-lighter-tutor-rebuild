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

    // Only handle incoming text messages
    if (body.typeWebhook !== 'incomingMessageReceived') {
      return NextResponse.json({ received: true })
    }

    const messageData = body.messageData
    if (!messageData || messageData.typeMessage !== 'textMessage') {
      return NextResponse.json({ received: true })
    }

    const rawText: string = messageData.textMessageData?.textMessage || ''
    if (!rawText.trim()) return NextResponse.json({ received: true })

    // Parse: "SESSION_ID: message content" (case-insensitive, tolerant of spaces)
    // Support formats: "ABC123: hi", "abc123: hi", "ABC123 : hi"
    const match = rawText.match(/^([A-Za-z0-9]{4,8})\s*:\s*(.+)/s)
    if (!match) {
      // Doesn't look like a session reply — ignore
      return NextResponse.json({ received: true })
    }

    const potentialSessionId = match[1].toUpperCase()
    const messageContent = match[2].trim()

    // Validate session ID format (5–7 alphanumeric chars to cover edge cases)
    if (!/^[A-Z0-9]{5,7}$/.test(potentialSessionId)) {
      return NextResponse.json({ received: true })
    }

    if (!messageContent) {
      return NextResponse.json({ received: true })
    }

    await dbConnect()

    const session = await ChatSession.findOne({ sessionId: potentialSessionId })
    if (!session || session.status === 'ai') {
      // Session not found or still in AI mode — ignore
      return NextResponse.json({ received: true })
    }

    // Handle session end command
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

    // Admin is joining for the first time — mark as live
    if (session.status === 'waiting') {
      session.status = 'live'
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
