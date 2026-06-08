import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { receiveNotification, deleteNotification } from '@/lib/whatsappService'

/**
 * Pull-based WhatsApp notification drainer.
 *
 * Previously this route processed admin WhatsApp replies and routed them
 * to visitor chat sessions. Admin communication now goes exclusively through
 * the dashboard, so this route simply drains (acknowledges and deletes) any
 * queued notifications to keep Green API's queue clean.
 */
async function handler(_request: AuthenticatedRequest) {
  try {
    let processed = 0
    const MAX_PER_CALL = 10

    for (let i = 0; i < MAX_PER_CALL; i++) {
      const notification = await receiveNotification()
      if (!notification) break

      const { receiptId } = notification
      await deleteNotification(receiptId)
      processed++
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('[WA Poll] Fatal error:', err)
    return NextResponse.json({ ok: false, processed: 0 }, { status: 500 })
  }
}

export const POST = withAuth(handler)
