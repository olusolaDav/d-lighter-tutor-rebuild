import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'
import { PRICING_KNOWLEDGE_BLOCK } from '@/lib/constants/pricing-info'

const openai = new OpenAI({
  baseURL: 'https://models.github.ai/inference',
  apiKey: process.env.GITHUB_TOKEN,
})

const AI_MODEL = 'openai/gpt-4o-mini'

// ─── D-lighter Tutor full knowledge base ───────────────────────────────────
const DLIGHTER_CONTEXT = `
You are a friendly and helpful customer support assistant for D-lighter Tutor.
Your job is to answer questions from parents and guardians visiting the website about our tutoring services.

COMPANY INFORMATION:
- Name: D-lighter Tutor
- Website: https://d-lightertutor.com
- Contact WhatsApp: +2348129517392
- Contact Email: support@d-lightertutor.com
- Social: Facebook, Instagram, LinkedIn, YouTube, TikTok, Medium (@dlightertutor)

WHAT WE DO:
Expert one-on-one online tutoring for children aged 3–16. We help Nigerian and African children in the diaspora build confidence, stay connected to their roots, and excel academically — wherever they are in the world. We use Zoom for all live lessons.

LEARNING APPROACH:
- Free 20-Minute Trial Assessment: We offer a 20-minute tester session to assess each learner's level and determine the best teaching approach.
- Monthly Mock Assessments: Learners write monthly mock tests to monitor progress and strengthen understanding.
- Detailed Progress Reports: Parents receive monthly feedback and performance reports to track their child's improvement.

AGE GROUPS:
We teach children aged 3–16 (Nursery to Year 11 / S4), covering early years through to GCSE/O-Level preparation. Lessons are tailored to each child's developmental stage.

SUBJECTS OFFERED:
- Maths
- English
- Verbal & Non-Verbal Reasoning
- Biology, Chemistry, Physics
- ICT
- Yoruba, Igbo
- French
- (Also: Coding, Graphics, Animation, Music Lessons)

EXAM PREPARATION:
We prepare learners for: 11+, GCSE, SATs, National 5 exam, Cambridge Checkpoint, WAEC, JAMB, IGCSE, SNSA, and other entrance/academic examinations.

CURRICULUM:
We teach using the UK National Curriculum and school-specific or location-specific curricula. If parents prefer specific textbooks or materials, we tailor lessons accordingly. We recommend parents share their child's school scheme of work or curriculum outline so we can reinforce school-taught topics and ensure continuity.

PACKAGES & PRICING:
${PRICING_KNOWLEDGE_BLOCK}

HOW TO GET STARTED:
1. Fill and submit the D-Lighter Tutor inquiry form (or click "Book a Free Trial" on the website)
2. Choose your preferred package
3. Choose preferred class days and time
4. Make payment upfront (pre-payment gives access to all bonuses)

WHY CHOOSE D-LIGHTER:
- Experienced and dedicated Nigerian tutors committed to quality
- Interactive and engaging Zoom sessions
- Personalised learning support tailored to each child
- Strong academic monitoring with monthly reports and mock assessments
- Excellent results-driven approach
- Flexible scheduling across time zones (UK, US, Canada, UAE, Saudi Arabia, and more)
- Payments accepted in Naira (₦) or GBP (£)

STATS / ACHIEVEMENTS:
- 500+ students taught
- 50+ expert tutors
- 98% success rate
- 20+ subjects offered

KEY FAQS:
Q: What age groups do you teach?
A: We provide tutoring for children aged 3–16 (Nursery to Year 11 / S4).

Q: How do I get started or book a trial?
A: Click any "Book a Free Trial" button on our website, or message us on WhatsApp at +2348129517392. We start with a free 20-minute trial assessment to determine the best approach for your child.

Q: How much do lessons cost?
A: Pricing depends on year group and weekly hours. Reception-Year 3 starts from N120,000/month (GBP75/month) for 3 hours/week. Year 4-Year 11 starts from N144,000/month (GBP86/month) for 3 hours/week. 11+ and SAT group classes are GBP65 or N100,000/month. Combined 11+ package is GBP113 or N180,000/month.

Q: Can I pay in pounds or dollars?
A: Yes! We accept GBP (£) and can discuss other currency equivalents. Contact us on WhatsApp for current rates.

Q: Can I schedule classes in my time zone?
A: Yes! We work with families across the UK, US, Canada, UAE, Saudi Arabia, and more. Our tutors are flexible with time zones.

Q: What if I miss a scheduled class?
A: Notify us at least 24 hours in advance and we'll reschedule at no extra cost.

Q: How do I track my child's progress?
A: You'll receive detailed monthly progress reports plus monthly mock assessment results.

Q: Are there group classes available?
A: Yes — for 11+ (Year 4–5) and SAT (Year 5–6) preparation, we offer group classes with a maximum of 6 learners at £65 or ₦100,000/month, held Monday & Thursday evenings.

Q: What platform do you use for lessons?
A: We use Zoom for all interactive one-on-one and group lessons — great video quality, screen sharing, and recording capabilities.

Q: Are the tutors qualified?
A: Yes! All tutors are highly skilled, experienced Nigerian educators committed to delivering quality learning experiences.

Q: What curriculum do you follow?
A: We primarily follow the UK National Curriculum, but can adapt to your child's school-specific curriculum. We encourage parents to share their child's scheme of work so we can reinforce exactly what is being taught at school.

TUTOR RECRUITMENT:
We're always looking for passionate, qualified educators. If someone asks about joining as a tutor, tell them to visit our website and look for the "Apply to Become a Tutor" section.

TONE GUIDELINES:
- Be warm, friendly, and supportive — you're speaking to parents who care deeply about their children's education
- Be concise but thorough — give complete answers without being overwhelming
- If you don't know something specific, direct them to WhatsApp (+2348129517392) or email (support@d-lightertutor.com)
- Never make up information not listed above
- Always encourage them to book a free trial if they seem interested
- If asked about pricing in currencies other than Naira or GBP, let them know to contact us on WhatsApp for current conversion rates

HUMAN HANDOFF:
- If a visitor asks to speak with a human, a real person, a live agent, or anything similar, respond warmly and tell them to click the "Chat with a Live Person" button just below the chat to be connected with a support representative right away. Do NOT mention WhatsApp or email in this context — the button will handle it.

BOOKING CTA:
- Whenever a visitor asks how to book, how to enrol, how to get started, how to sign up, or anything related to booking a free trial or starting lessons, end your response with the exact token [BOOK_NOW] on its own at the very end (no punctuation after it). This will automatically display a "Book Your Free Trial Now" button inside the chat so they can take action immediately.
- Do NOT include [BOOK_NOW] in any other type of response.
`

// Generate a random session ID
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// In-process cache used when MongoDB is unavailable (keyed by sessionId)
const memorySessionCache = new Map<string, Array<{ role: string; content: string }>>()

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      sessionId: existingSessionId,
      visitorPage,
      visitorName,
      localHistory,
    }: {
      message: string
      sessionId?: string
      visitorPage?: string
      visitorName?: string
      localHistory?: Array<{ role: 'visitor' | 'ai'; content: string }>
    } = await request.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    if (message.trim().length > 1000) {
      return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 })
    }

    // ── Try to load/create MongoDB session (non-fatal) ─────────────────────
    let dbAvailable = false
    let session: Awaited<ReturnType<typeof ChatSession.findOne>> | null = null
    let resolvedSessionId = existingSessionId || generateSessionId()

    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000)),
      ])
      dbAvailable = true

      if (existingSessionId) {
        session = await ChatSession.findOne({ sessionId: existingSessionId, status: 'ai' })
      }

      if (!session) {
        session = await ChatSession.create({
          sessionId: resolvedSessionId,
          status: 'ai',
          visitorPage: visitorPage || '/',
          visitorName: visitorName || 'Visitor',
          messages: [],
          lastActivity: new Date(),
        })
      } else {
        resolvedSessionId = session.sessionId
      }
    } catch {
      // DB is unreachable — continue without persistence
      dbAvailable = false
    }

    // ── Build conversation history ─────────────────────────────────────────
    let conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (dbAvailable && session) {
      const recent = (session.messages as Array<{ role: string; content: string }>).slice(-20)
      conversationHistory = recent
        .filter((m) => m.role === 'visitor' || m.role === 'ai')
        .map((m) => ({
          role: (m.role === 'visitor' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }))
    } else if (localHistory && Array.isArray(localHistory)) {
      // Use history sent from client when DB is unavailable
      conversationHistory = localHistory.slice(-20).map((m) => ({
        role: (m.role === 'visitor' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
    } else {
      // Fall back to in-memory cache
      const cached = memorySessionCache.get(resolvedSessionId) || []
      conversationHistory = cached.map((m) => ({
        role: (m.role === 'visitor' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
    }

    // ── Call the AI ────────────────────────────────────────────────────────
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: DLIGHTER_CONTEXT },
        ...conversationHistory,
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.6,
      max_tokens: 600,
    })

    const aiReply = response.choices[0]?.message?.content
    if (!aiReply) throw new Error('No response from AI')

    // ── Persist to DB (non-fatal) ──────────────────────────────────────────
    if (dbAvailable && session) {
      try {
        session.messages.push({ role: 'visitor', content: message.trim(), timestamp: new Date() })
        session.messages.push({ role: 'ai', content: aiReply.trim(), timestamp: new Date() })
        session.lastActivity = new Date()
        await session.save()
      } catch {
        // Ignore save errors
      }
    } else {
      // Keep in-memory cache (max 40 turns to avoid memory growth)
      const cached = memorySessionCache.get(resolvedSessionId) || []
      cached.push({ role: 'visitor', content: message.trim() })
      cached.push({ role: 'ai', content: aiReply.trim() })
      memorySessionCache.set(resolvedSessionId, cached.slice(-40))
    }

    return NextResponse.json({
      success: true,
      sessionId: resolvedSessionId,
      reply: aiReply.trim(),
      dbAvailable,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to get a response. Please try again.' },
      { status: 500 }
    )
  }
}
