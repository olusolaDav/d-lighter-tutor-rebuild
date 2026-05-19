/**
 * Green API helper for sending WhatsApp messages.
 * Setup: Register at https://green-api.com, scan QR with admin's WhatsApp,
 * then set GREEN_API_INSTANCE_ID and GREEN_API_TOKEN in .env.local
 */

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const API_TOKEN = process.env.GREEN_API_TOKEN
const BASE_URL = `https://api.green-api.com/waInstance${INSTANCE_ID}`

// Format phone number to Green API chatId format
// e.g. "2348032158383" → "2348032158383@c.us"
function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `${digits}@c.us`
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!INSTANCE_ID || !API_TOKEN) {
    console.warn('[WhatsApp] GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set — skipping send')
    return false
  }

  try {
    const res = await fetch(`${BASE_URL}/sendMessage/${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: toChatId(phone),
        message,
      }),
    })

    if (!res.ok) {
      console.error('[WhatsApp] Send failed:', await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error('[WhatsApp] Send error:', err)
    return false
  }
}
