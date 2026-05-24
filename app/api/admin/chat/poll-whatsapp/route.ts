import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { receiveNotification, deleteNotification } from '@/lib/whatsappService'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'

/**
 * Pull-based WhatsApp notification processor.
 *
 * Because Green API's HTTP push webhooks are unreliable on the free (Developer)
 * plan, this route is called periodically by the admin chat dashboard to drain
 * Green API's internal notification queue directly.
 *
 * It applies the same routing logic as the webhook POST handler:
 *   - "SESSION_ID: message"  → route to that session
 *   - "END" or "SESSION_ID: END" → close the session
 *   - Single active session, no prefix → auto-route
 */
async function handler(_request: AuthenticatedRequest) {
  try {
    await dbConnect()

    let processed = 0
    const MAX_PER_CALL = 10 // drain up to 10 queued messages per admin poll cycle

    for (let i = 0; i < MAX_PER_CALL; i++) {
      const notification = await receiveNotification()
      if (!notification) break // queue is empty

      const { receiptId, body } = notification

      try {
        await processNotification(body)
        processed++
      } catch (err) {
        console.error('[WA Poll] Error processing notification:', err)
      }

      // Always delete to advance the queue, even on processing errors
      await deleteNotification(receiptId)
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('[WA Poll] Fatal error:', err)
    return NextResponse.json({ ok: false, processed: 0 }, { status: 500 })
  }
}

// ─── Core processing logic (mirrors webhook/whatsapp/route.ts) ────────────────

async function processNotification(body: any): Promise<void> {
  // Only handle message events
  const allowedTypes = ['incomingMessageReceived', 'outgoingMessageReceived']
  if (!allowedTypes.includes(body?.typeWebhook)) return

  const messageData = body.messageData
  const supportedMsgTypes = ['textMessage', 'extendedTextMessage']
  if (!messageData || !supportedMsgTypes.includes(messageData.typeMessage)) return

  const rawText: string =
    messageData.textMessageData?.textMessage ||
    messageData.extendedTextMessageData?.text ||
    ''
  if (!rawText.trim()) return

  // Skip notification messages our server sent (avoid echo loops)
  const NOTIFICATION_PREFIXES = ['🔔', '👤', '⚠️', '📋']
  if (NOTIFICATION_PREFIXES.some((p) => rawText.startsWith(p))) return

  // Fetch active sessions
  const activeSessions = await ChatSession.find({
    status: { $in: ['waiting', 'live'] },
  }).sort({ lastActivity: -1 })

  if (activeSessions.length === 0) return

  // Parse optional "SESSION_ID: message" prefix
  const prefixMatch = rawText.match(/^([A-Za-z0-9]{4,8})\s*:\s*(.+)/s)
  const prefixId =
    prefixMatch && /^[A-Z0-9]{5,7}$/.test(prefixMatch[1].toUpperCase())
      ? prefixMatch[1].toUpperCase()
      : null

  let session: (typeof activeSessions)[0] | null = null
  let messageContent = rawText.trim()

  if (prefixId) {
    session = activeSessions.find((s) => s.sessionId === prefixId) ?? null
    if (!session) return // unknown session ID
    messageContent = prefixMatch![2].trim()
  } else if (activeSessions.length === 1) {
    session = activeSessions[0] // auto-route when only one session is active
  } else {
    return // multiple sessions, prefix required
  }

  if (!messageContent) return

  // ── END command ────────────────────────────────────────────────────────────
  if (messageContent.toUpperCase() === 'END') {
    session.status = 'ended'
    const agentLabel = session.agentName || 'the D-lighter team'
    session.messages.push({
      role: 'system',
      content: `Thank you for choosing D-lighter Tutor 🌟\nWe look forward to supporting your child's learning journey. If you need further assistance, don't hesitate to reach out. Have a wonderful day! — ${agentLabel}`,
      timestamp: new Date(),
    })
    session.lastActivity = new Date()
    await session.save()
    return
  }

  // ── Agent joins for the first time ────────────────────────────────────────
  if (session.status === 'waiting') {
    session.status = 'live'
    const welcomeName =
      session.visitorName && session.visitorName !== 'Visitor'
        ? `, ${session.visitorName}`
        : ''
    session.messages.push({
      role: 'system',
      content: `🟢 A D-lighter support agent has joined the chat${welcomeName}! They can see your full conversation.`,
      timestamp: new Date(),
    })
  }

  // ── Detect agent name from greeting ───────────────────────────────────────
  if (!session.agentName) {
    const nameMatch = messageContent.match(/my name is ([A-Za-z]+)/i)
    if (nameMatch) session.agentName = nameMatch[1].trim()
  }

  // ── Save admin reply ───────────────────────────────────────────────────────
  session.messages.push({
    role: 'admin',
    content: messageContent,
    timestamp: new Date(),
  })
  session.lastActivity = new Date()
  await session.save()
}

export const POST = withAuth(handler)
