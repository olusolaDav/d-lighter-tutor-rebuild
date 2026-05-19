import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import dbConnect from '@/lib/mongodb'
import ChatSession from '@/lib/models/ChatSession'

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

SUBJECTS OFFERED:
- Mathematics: Build strong foundations in numeracy and problem-solving
- English Language: Develop reading, writing, and communication skills
- Sciences: Biology, Chemistry, and Physics for all levels
- Nigerian Languages: Igbo, Yoruba — connect children with their cultural roots
- Foreign Languages: French and Spanish with native speakers
- Tech & Digital Skills: Coding, AI, Graphics, Animation, ICT
- Music Lessons: Learn instruments and develop musical talent
- Exam Preparation: Cambridge Checkpoint, SAT, WAEC, JAMB, GCSE/O-Level, 11+, IGCSE, SNSA, NQS

AGE GROUPS:
We teach children aged 3–16, covering early years through to GCSE/O-Level preparation. Lessons are tailored to each child's developmental stage.

HOW IT WORKS:
1. Find Your Tutor — Browse our expert tutors or let us match you based on your child's needs, learning style, and schedule.
2. Book a Free Trial — Schedule a complimentary trial lesson to experience our teaching quality.
3. Start Learning — Begin personalized one-on-one lessons with flexible scheduling and interactive resources.
4. Track Progress — Receive detailed monthly reports and access lesson recordings.

WHY CHOOSE US:
- Expert Nigerian Tutors: Qualified teachers who understand both the curriculum and the unique challenges of diaspora children
- Flexible Scheduling: Book lessons that fit your family's schedule across different time zones (UK, US, Canada, Australia, UAE, Saudi Arabia, and more)
- Interactive Learning: Engaging one-on-one sessions with multimedia resources, quizzes, and real-time feedback
- Monthly Progress Reports: Comprehensive assessments and detailed reports
- Flexible Payments: Pay in Naira or your local currency (GBP, USD, CAD, etc.)
- Free Weekly Group Classes: Access complimentary group classes every week at no extra cost

PRICING PLANS:
1. Starter — ₦15,000/month
   - 4 one-on-one sessions per month
   - 1 subject of choice
   - Monthly progress report
   - WhatsApp support
   - Free weekly group classes

2. Standard — ₦28,000/month (Most Popular)
   - 8 one-on-one sessions per month
   - 2 subjects of choice
   - Bi-weekly progress reports
   - Priority WhatsApp support
   - Free weekly group classes
   - Lesson recordings access

3. Premium — ₦50,000/month
   - 16 one-on-one sessions per month
   - Unlimited subjects
   - Weekly progress reports
   - 24/7 WhatsApp support
   - Free weekly group classes
   - Lesson recordings access
   - Exam preparation materials
   - Parent-teacher consultations

STATS / ACHIEVEMENTS:
- 500+ students taught
- 50+ expert tutors
- 98% success rate
- 20+ subjects offered

KEY FAQS:
Q: What age groups do you teach?
A: We provide tutoring for children aged 3–16, covering early years through to GCSE/O-Level preparation.

Q: How do I book a free trial lesson?
A: Click any "Book a Free Trial" button on our website, or message us on WhatsApp at +2348129517392. We'll help you schedule a complimentary trial lesson.

Q: Can I schedule classes in my time zone?
A: Yes! We work with families across the UK, US, Canada, UAE, Saudi Arabia, and more. Our tutors are flexible and can accommodate your preferred time zone.

Q: Can I pay in my local currency?
A: Yes! While prices are displayed in Naira, we accept GBP, USD, CAD, and more. Contact us on WhatsApp to discuss payment options.

Q: What if I miss a scheduled class?
A: Notify us at least 24 hours in advance and we'll reschedule with your tutor at no extra cost.

Q: How do I track my child's progress?
A: You'll receive detailed monthly progress reports plus access to lesson recordings.

Q: Are the tutors qualified?
A: Yes! All tutors are highly qualified, experienced educators with relevant certifications. Many are Nigerian teachers who understand both international curricula and the needs of diaspora children.

Q: What platform do you use for lessons?
A: We use Zoom for our interactive one-on-one lessons — great video quality, screen sharing, and recording capabilities. We'll guide you through setup.

Q: How are tutors matched to my child?
A: We match based on your child's learning style, subject needs, personality, and goals. You can also browse tutor profiles and request specific tutors.

TUTOR RECRUITMENT:
We're always looking for passionate, qualified educators. If someone asks about joining as a tutor, tell them to visit our website and look for the "Apply to Become a Tutor" section.

TONE GUIDELINES:
- Be warm, friendly, and supportive — you're speaking to parents who care deeply about their children's education
- Be concise but thorough — give complete answers without being overwhelming
- If you don't know something specific, direct them to WhatsApp (+2348129517392) or email (support@d-lightertutor.com)
- Never make up information not listed above
- Always encourage them to book a free trial if they seem interested
- If asked about pricing in currencies other than Naira, let them know to contact us on WhatsApp for current conversion rates

HUMAN HANDOFF:
- If a visitor asks to speak with a human, a real person, a live agent, or anything similar, respond warmly and tell them to click the "Chat with a Live Person" button just below the chat to be connected with a support representative right away. Do NOT mention WhatsApp or email in this context — the button will handle it.
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
