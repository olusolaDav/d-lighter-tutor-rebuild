'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle, X, Send, Bot, User, Headphones,
  ChevronDown, Loader2, RotateCcw,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMode = 'ai' | 'waiting' | 'live' | 'ended'
type HumanSetup = null | 'asking-name' | 'asking-phone'

interface Message {
  id: string
  role: 'visitor' | 'admin' | 'ai' | 'system'
  content: string
  timestamp: Date
}

interface StoredChat {
  messages: Message[]
  sessionId: string | null
  mode: ChatMode
  visitorName: string
  visitorPhone: string
  savedAt: number
}

// ─── LocalStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'dlighter_chat_v2'

function loadFromStorage(): Partial<StoredChat> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data: StoredChat = JSON.parse(raw)
    // Expire after 24 hours
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return {}
    }
    return {
      ...data,
      messages: (data.messages || []).map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return {}
  }
}

function saveToStorage(data: Omit<StoredChat, 'savedAt'>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }))
  } catch {
    // Quota exceeded — ignore
  }
}

function clearStorage() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Quick suggestions ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What subjects do you offer?',
  'How much are your lessons?',
  'What ages do you teach?',
  'How do I book a free trial?',
  'Can I pay in pounds/dollars?',
]

// ─── Utility ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ─── Message bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg, agentName }: { msg: Message; agentName?: string }) {
  const isVisitor = msg.role === 'visitor'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full max-w-[90%] text-center leading-relaxed">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 mb-3 ${isVisitor ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
          ${isVisitor ? 'bg-blue-500' : msg.role === 'ai' ? 'bg-purple-600' : 'bg-green-600'}`}
      >
        {isVisitor ? (
          <User size={14} />
        ) : msg.role === 'ai' ? (
          <Bot size={14} />
        ) : (
          <Headphones size={14} />
        )}
      </div>
      <div className={`max-w-[78%] ${isVisitor ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isVisitor && (
          <span className="text-[10px] text-gray-400 mb-0.5 ml-1">
            {msg.role === 'ai' ? 'D-lighter AI' : agentName ? agentName : 'Support Agent'}
          </span>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isVisitor
              ? 'bg-blue-600 text-white rounded-br-sm'
              : msg.role === 'ai'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-purple-100 dark:border-purple-900'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm'
            }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 mx-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  )
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 rounded-2xl rounded-bl-sm px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 mr-1">{label}</span>
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Chat Widget ─────────────────────────────────────────────────────────

export function ChatWidget() {
  // Load persisted data synchronously on first render
  const stored = useRef<Partial<StoredChat> | null>(null)
  if (stored.current === null) {
    stored.current = loadFromStorage()
  }

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(
    stored.current.messages || []
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<ChatMode>(stored.current.mode || 'ai')
  const [sessionId, setSessionId] = useState<string | null>(
    stored.current.sessionId || null
  )
  const [hasUnread, setHasUnread] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(
    !stored.current.messages?.length || stored.current.messages.length <= 1
  )
  const [humanSetup, setHumanSetup] = useState<HumanSetup>(null)
  const [visitorName, setVisitorName] = useState(stored.current.visitorName || '')
  const [visitorPhone, setVisitorPhone] = useState(stored.current.visitorPhone || '')
  const [isConnecting, setIsConnecting] = useState(false)
  const [agentName, setAgentName] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMsgCountRef = useRef(stored.current.messages?.length || 0)
  const prevModeRef = useRef<ChatMode>(stored.current.mode || 'ai')
  // Refs so the poll closure always reads the latest value without triggering effect re-runs
  const isOpenRef = useRef(isOpen)
  const visitorNameRef = useRef(visitorName)
  isOpenRef.current = isOpen
  visitorNameRef.current = visitorName

  // ── Persist to localStorage on every relevant state change ───────────────
  useEffect(() => {
    saveToStorage({ messages, sessionId, mode, visitorName, visitorPhone })
  }, [messages, sessionId, mode, visitorName, visitorPhone])

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Welcome message on first open (if no history) ────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0 && mode === 'ai') {
      setMessages([
        {
          id: uid(),
          role: 'ai',
          content:
            "👋 Hi! I'm D-lighter's AI assistant. I'm here to answer any questions you have about our tutoring services — subjects, pricing, scheduling, and more!\n\nHow can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ── Restart / Reload chat ─────────────────────────────────────────────────
  const resetChat = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    clearStorage()
    setMessages([])
    setSessionId(null)
    setMode('ai')
    setVisitorName('')
    setVisitorPhone('')
    setHumanSetup(null)
    setInput('')
    setShowSuggestions(true)
    setIsConnecting(false)
    lastMsgCountRef.current = 0
    prevModeRef.current = 'ai'

    setTimeout(() => {
      setMessages([
        {
          id: uid(),
          role: 'ai',
          content:
            "👋 Hi! I'm D-lighter's AI assistant. I'm here to answer any questions you have about our tutoring services — subjects, pricing, scheduling, and more!\n\nHow can I help you today?",
          timestamp: new Date(),
        },
      ])
    }, 50)
  }, [])

  // ── Poll for admin replies (live / waiting modes) ─────────────────────────
  // shouldPoll only flips between false↔true (ai/ended ↔ waiting/live)
  // so the interval is NOT destroyed on every mode change (e.g. waiting→live)
  const shouldPoll = mode === 'waiting' || mode === 'live'
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (!sessionId || !shouldPoll) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sessionId}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!data.success) return

        const serverMsgs: Message[] = data.messages.map(
          (m: { role: string; content: string; timestamp: string }) => ({
            id: uid(),
            role: m.role as Message['role'],
            content: m.content,
            timestamp: new Date(m.timestamp),
          })
        )

        const newMode = data.status as ChatMode
        prevModeRef.current = newMode

        setMessages(serverMsgs)
        setMode(newMode)
        if (data.agentName) setAgentName(data.agentName)

        if (serverMsgs.length > lastMsgCountRef.current && !isOpenRef.current) {
          setHasUnread(true)
        }
        lastMsgCountRef.current = serverMsgs.length

        if (newMode === 'ended' && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      } catch {
        // Ignore transient network errors
      }
    }

    poll() // fetch immediately — don't wait for first interval tick
    pollIntervalRef.current = setInterval(poll, 3000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [sessionId, shouldPoll])

  // ── Send AI message ──────────────────────────────────────────────────────
  const sendAiMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: Message = {
        id: uid(),
        role: 'visitor',
        content: text.trim(),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMsg])
      setInput('')
      setShowSuggestions(false)
      setIsLoading(true)
      try {
        const res = await fetch('/api/chat/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            sessionId,
            visitorPage: window.location.pathname,
            visitorName,
            localHistory: messages
              .filter(m => m.role === 'visitor' || m.role === 'ai')
              .slice(-20)
              .map(m => ({ role: m.role, content: m.content })),
          }),
        })
        const data = await res.json()
        if (data.success) {
          if (!sessionId) setSessionId(data.sessionId)
          setMessages(prev => [
            ...prev,
            {
              id: uid(),
              role: 'ai',
              content: data.reply,
              timestamp: new Date(),
            },
          ])
          setShowSuggestions(true)
        } else throw new Error(data.error)
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: uid(),
            role: 'system',
            content: 'Sorry, I had trouble responding. Please try again.',
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, sessionId, messages, visitorName]
  )

  // ── Send live message ────────────────────────────────────────────────────
  const sendLiveMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId || mode === 'ended') return

      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'visitor', content: text.trim(), timestamp: new Date() },
      ])
      setInput('')

      try {
        await fetch('/api/chat/live/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: text.trim() }),
        })
      } catch {
        // Polling will resync
      }
    },
    [sessionId, mode]
  )

  // ── Connect to human (called after collecting name + phone) ──────────────
  const connectToHuman = useCallback(
    async (name: string, phone: string) => {
      setIsConnecting(true)

      let sid = sessionId
      // Ensure a session exists in the DB
      if (!sid) {
        try {
          const res = await fetch('/api/chat/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'I would like to speak with a human agent.',
              visitorPage: window.location.pathname,
              visitorName: name,
            }),
          })
          const data = await res.json()
          if (data.success) {
            sid = data.sessionId
            setSessionId(sid)
          }
        } catch {
          /* continue anyway */
        }
      }

      try {
        const res = await fetch('/api/chat/live/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            visitorPage: window.location.pathname,
            visitorName: name,
            visitorPhone: phone,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setMode('waiting')
          setMessages(prev => [
            ...prev,
            {
              id: uid(),
              role: 'system',
              content:
                '✅ Our team has been notified! An agent will join the chat shortly. Feel free to type any additional details below.',
              timestamp: new Date(),
            },
          ])
        } else throw new Error(data.error)
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: uid(),
            role: 'system',
            content:
              'Unable to connect right now. Please reach us on WhatsApp: +2348129517392',
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsConnecting(false)
        setHumanSetup(null)
      }
    },
    [sessionId]
  )

  // ── Start human-setup: ask name first ────────────────────────────────────
  const startHumanSetup = useCallback(() => {
    if (isConnecting || humanSetup !== null) return
    setHumanSetup('asking-name')
    setShowSuggestions(false)
    setMessages(prev => [
      ...prev,
      {
        id: uid(),
        role: 'system',
        content: "Connecting you with a team member 🙌 — I just need a couple of quick details!",
        timestamp: new Date(),
      },
      {
        id: uid(),
        role: 'ai',
        content: "What's your name?",
        timestamp: new Date(Date.now() + 100),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [isConnecting, humanSetup])

  // ── Handle send — routes to AI, live, or humanSetup flow ────────────────
  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return

    // ── Collecting visitor name ──
    if (humanSetup === 'asking-name') {
      const name = text
      setVisitorName(name)
      setInput('')
      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'visitor', content: name, timestamp: new Date() },
        {
          id: uid(),
          role: 'ai',
          content: `Nice to meet you, ${name}! 😊\n\nWhat's the best phone number to reach you? (Type "skip" to continue without one.)`,
          timestamp: new Date(Date.now() + 100),
        },
      ])
      setHumanSetup('asking-phone')
      return
    }

    // ── Collecting visitor phone ──
    if (humanSetup === 'asking-phone') {
      const phone = text.toLowerCase() === 'skip' ? '' : text
      setVisitorPhone(phone)
      setInput('')
      setMessages(prev => [
        ...prev,
        { id: uid(), role: 'visitor', content: text, timestamp: new Date() },
        {
          id: uid(),
          role: 'system',
          content: 'Connecting you now — please hold on a moment…',
          timestamp: new Date(Date.now() + 100),
        },
      ])
      connectToHuman(visitorName, phone)
      return
    }

    // ── Normal routing ──
    if (mode === 'ai') {
      sendAiMessage(text)
    } else if (mode === 'live' || mode === 'waiting') {
      sendLiveMessage(text)
    }
  }, [input, mode, humanSetup, visitorName, sendAiMessage, sendLiveMessage, connectToHuman])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Status badge ─────────────────────────────────────────────────────────
  const statusInfo = {
    ai: { label: 'AI Assistant', dot: 'bg-purple-300' },
    waiting: { label: 'Connecting to agent…', dot: 'bg-yellow-300 animate-pulse' },
    live: { label: 'Agent online', dot: 'bg-green-300' },
    ended: { label: 'Chat ended', dot: 'bg-gray-300' },
  }[mode]

  const inputPlaceholder =
    humanSetup === 'asking-name'
      ? 'Your name…'
      : humanSetup === 'asking-phone'
      ? 'Your phone number (or type "skip")…'
      : mode === 'waiting'
      ? 'Type your message…'
      : mode === 'live'
      ? 'Reply to agent…'
      : 'Ask a question…'

  const sendDisabled = !input.trim() || (isLoading && humanSetup === null)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
          role="dialog"
          aria-label="D-lighter Tutor Chat"
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {mode === 'live' ? <Headphones size={18} /> : <Bot size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">D-lighter Tutor Support</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                <span className="text-xs text-blue-100">{statusInfo.label}</span>
              </div>
            </div>
            {/* Restart button */}
            <button
              onClick={resetChat}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Restart chat"
              title="Start a new chat"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0 scroll-smooth">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} agentName={agentName} />
            ))}

            {isLoading && <TypingIndicator label="Thinking…" />}
            {mode === 'waiting' && !isLoading && !isConnecting && (
              <TypingIndicator label="Agent joining…" />
            )}
            {isConnecting && <TypingIndicator label="Connecting…" />}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick suggestions + CTA — shown in AI mode after every AI reply ── */}
          {mode === 'ai' && humanSetup === null && showSuggestions && !isLoading && (
            <div className="px-4 pb-2 flex-shrink-0 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
              {messages.some(m => m.role === 'ai') && (
                <p className="text-xs text-gray-400 text-center">Is there anything else I can help you with?</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setShowSuggestions(false); sendAiMessage(s) }}
                    className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={startHumanSetup}
                className="w-full text-xs py-2 rounded-lg border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-1.5 font-medium"
              >
                <Headphones size={13} />
                Chat with a Live Person
              </button>
            </div>
          )}

          {/* ── Input area ── */}
          {mode !== 'ended' ? (
            <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                rows={1}
                maxLength={2000}
                className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent max-h-32 overflow-y-auto leading-relaxed"
                style={{ minHeight: '42px' }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={sendDisabled}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white flex-shrink-0"
              >
                {isLoading && humanSetup === null ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 text-center flex-shrink-0">
              <p className="text-xs text-gray-500 mb-2">This session has ended.</p>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Continue on WhatsApp →
              </a>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              Powered by D-lighter Tutor · AI may make mistakes
            </p>
          </div>
        </div>
      )}
    </>
  )
}
