import { NextRequest, NextResponse } from 'next/server'

/**
 * Green API Webhook — no longer processes admin WhatsApp replies.
 *
 * Admin communication now goes exclusively through the dashboard.
 * WhatsApp is used only for one-way notifications (alerting admin of
 * new visitor messages with a link to reply on the dashboard).
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ received: true })
}
export async function GET() {
  const instanceId = process.env.GREEN_API_INSTANCE_ID
  const apiToken = process.env.GREEN_API_TOKEN

  if (!instanceId || !apiToken) {
    return NextResponse.json({
      status: 'ok',
      service: 'd-lighter-chat-webhook',
      greenApi: { configured: false, reason: 'GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set' },
    })
  }

  try {
    const [stateRes, settingsRes] = await Promise.all([
      fetch(`https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`),
      fetch(`https://api.green-api.com/waInstance${instanceId}/getSettings/${apiToken}`),
    ])
    const state = stateRes.ok ? await stateRes.json() : null
    const settings = settingsRes.ok ? await settingsRes.json() : null

    return NextResponse.json({
      status: 'ok',
      service: 'd-lighter-chat-webhook',
      greenApi: {
        configured: true,
        instanceId,
        instanceState: state?.stateInstance ?? 'unknown',
        authorized: state?.stateInstance === 'authorized',
        webhookUrl: settings?.webhookUrl ?? null,
        outgoingWebhook: settings?.outgoingWebhook ?? null,
        incomingWebhook: settings?.incomingWebhook ?? null,
        outgoingAPIMessageWebhook: settings?.outgoingAPIMessageWebhook ?? null,
      },
    })
  } catch {
    return NextResponse.json({
      status: 'ok',
      service: 'd-lighter-chat-webhook',
      greenApi: { configured: true, instanceId, error: 'Failed to reach Green API' },
    })
  }
}
