'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Headphones, ChevronDown, Loader2 } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ChatMode = 'ai' | 'waiting' | 'live' | 'ended'
type WidgetStep = 'name' | 'chat'

interface Message {
  id: string
  role: 'visitor' | 'admin' | 'ai' | 'system'
  content: string
  timestamp: Date
}

// ─── Quick-reply suggestions shown to new visitors ─────────────────────────
const SUGGESTIONS = [
  'What subjects do you offer?',
  'How much are your lessons?',
  'What ages do you teach?',
  'How do I book a free trial?',
  'Can I pay in pounds/dollars?',
]

// ─── Utility ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isVisitor = msg.role === 'visitor'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full max-w-[90%] text-center">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 mb-3 ${isVisitor ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
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

      {/* Bubble */}
      <div className={`max-w-[78%] ${isVisitor ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isVisitor && (
          <span className="text-[10px] text-gray-400 mb-0.5 ml-1">
            {msg.role === 'ai' ? 'D-lighter AI' : 'Support Agent'}
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

// ─── Typing indicator ───────────────────────────────────────────────────────

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

// ─── Main Chat Widget ────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<WidgetStep>('name')
  const [visitorName, setVisitorName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<ChatMode>('ai')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [requestingHuman, setRequestingHuman] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMessageCountRef = useRef(0)

  // ── Scroll to bottom ────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Welcome message once name is confirmed ───────────────────────────────
  useEffect(() => {
    if (isOpen && step === 'chat' && messages.length === 0 && visitorName) {
      setMessages([
        {
          id: uid(),
          role: 'ai',
          content: `👋 Hi ${visitorName}! I'm D-lighter's AI assistant. I'm here to answer any questions you have about our tutoring services — subjects, pricing, scheduling, and more!\n\nHow can I help you today?`,
          timestamp: new Date(),
        },
      ])
    }
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, step, messages.length, visitorName])

  // ── Poll for session updates when in live/waiting mode ──────────────────
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (!sessionId || mode === 'ai') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sessionId}`)
        if (!res.ok) return
        const data = await res.json()
        if (!data.success) return

        // Sync all messages from server
        const serverMessages: Message[] = data.messages.map((m: {
          role: string
          content: string
          timestamp: string
        }) => ({
          id: uid(),
          role: m.role as Message['role'],
          content: m.content,
          timestamp: new Date(m.timestamp),
        }))

        setMessages(serverMessages)
        setMode(data.status as ChatMode)

        // Notify if new messages arrived while widget is closed
        if (serverMessages.length > lastMessageCountRef.current && !isOpen) {
          setHasUnread(true)
        }
        lastMessageCountRef.current = serverMessages.length

        // Stop polling when session ends
        if (data.status === 'ended' && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      } catch {
        // Silently ignore poll errors
      }
    }

    pollIntervalRef.current = setInterval(poll, 3000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [sessionId, mode, isOpen])

  // ── Send AI message ──────────────────────────────────────────────────────
  const sendAiMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: uid(),
      role: 'visitor',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
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
          // Send local history as fallback when DB is unavailable
          localHistory: messages
            .filter((m) => m.role === 'visitor' || m.role === 'ai')
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        if (!sessionId) setSessionId(data.sessionId)
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'ai',
            content: data.reply,
            timestamp: new Date(),
          },
        ])
      } else {
        throw new Error(data.error)
      }
    } catch {
      setMessages((prev) => [
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
  }, [isLoading, sessionId])

  // ── Send live chat message ───────────────────────────────────────────────
  const sendLiveMessage = useCallback(async (text: string) => {
    if (!text.trim() || !sessionId || mode === 'ended') return

    const userMsg: Message = {
      id: uid(),
      role: 'visitor',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    try {
      await fetch('/api/chat/live/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text.trim() }),
      })
    } catch {
      // Message stored locally, polling will sync
    }
  }, [sessionId, mode])

  // ── Request human agent ──────────────────────────────────────────────────
  const requestHuman = useCallback(async () => {
    if (requestingHuman || !sessionId) return
    setRequestingHuman(true)

    // If no session yet, create one first with a placeholder AI chat
    let sid = sessionId
    if (!sid) {
      // Create a session via a dummy AI call
      try {
        const res = await fetch('/api/chat/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'I would like to speak with a human agent',
            visitorPage: window.location.pathname,
          }),
        })
        const data = await res.json()
        if (data.success) {
          sid = data.sessionId
          setSessionId(sid)
        }
      } catch {
        // continue anyway
      }
    }

    try {
      const res = await fetch('/api/chat/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          visitorPage: window.location.pathname,
          visitorName,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMode('waiting')
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'system',
            content:
              '✅ Your request has been sent to our support team. We\'ll be with you shortly!\n\nFeel free to type your question below while you wait.',
            timestamp: new Date(),
          },
        ])
      } else {
        throw new Error(data.error)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'system',
          content: 'Unable to connect to an agent right now. Please try WhatsApp: +2348129517392',
          timestamp: new Date(),
        },
      ])
    } finally {
      setRequestingHuman(false)
    }
  }, [requestingHuman, sessionId])

  // ── Handle send ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return

    if (mode === 'ai') {
      sendAiMessage(text)
    } else if (mode === 'live' || mode === 'waiting') {
      sendLiveMessage(text)
    }
  }, [input, mode, sendAiMessage, sendLiveMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Status badge ─────────────────────────────────────────────────────────
  const statusInfo = {
    ai: { label: 'AI Assistant', color: 'bg-purple-500', dot: 'bg-purple-300' },
    waiting: { label: 'Connecting to agent…', color: 'bg-yellow-500', dot: 'bg-yellow-300 animate-pulse' },
    live: { label: 'Agent online', color: 'bg-green-500', dot: 'bg-green-300' },
    ended: { label: 'Chat ended', color: 'bg-gray-400', dot: 'bg-gray-300' },
  }[mode]

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
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
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {mode === 'live' ? (
                <Headphones size={18} />
              ) : (
                <Bot size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">D-lighter Tutor Support</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                <span className="text-xs text-blue-100">{statusInfo.label}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* ── Name collection step ── */}
          {step === 'name' ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Welcome to D-lighter Tutor!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Before we start, what's your name?
                </p>
              </div>

              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nameInput.trim().length >= 2) {
                      setVisitorName(nameInput.trim())
                      setStep('chat')
                    }
                  }}
                  placeholder="Enter your name…"
                  maxLength={50}
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm px-4 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (nameInput.trim().length >= 2) {
                      setVisitorName(nameInput.trim())
                      setStep('chat')
                    }
                  }}
                  disabled={nameInput.trim().length < 2}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  Start Chat →
                </button>
              </div>

              <p className="text-[11px] text-gray-400 text-center">
                We only use your name to personalise your experience.
              </p>
            </div>
          ) : (
            <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0 scroll-smooth">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isLoading && <TypingIndicator label="Thinking…" />}

            {mode === 'waiting' && !isLoading && (
              <TypingIndicator label="Agent joining…" />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (AI mode, first interaction) */}
          {mode === 'ai' && showSuggestions && messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendAiMessage(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Talk to human button (AI mode only, once they've chatted) */}
          {mode === 'ai' && messages.length > 1 && (
            <div className="px-4 pb-2 flex-shrink-0">
              <button
                onClick={requestHuman}
                disabled={requestingHuman}
                className="w-full text-xs py-1.5 rounded-lg border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {requestingHuman ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Headphones size={12} />
                    Talk to a real person
                  </>
                )}
              </button>
            </div>
          )}

          {/* Input area */}
          {mode !== 'ended' ? (
            <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'waiting'
                    ? 'Type your message…'
                    : mode === 'live'
                    ? 'Reply to agent…'
                    : 'Ask a question…'
                }
                rows={1}
                maxLength={2000}
                className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent max-h-32 overflow-y-auto leading-relaxed"
                style={{ minHeight: '42px' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white flex-shrink-0"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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

          {/* Footer */}
          <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              Powered by D-lighter Tutor · AI may make mistakes
            </p>
          </div>
          </>
          )}
        </div>
      )}
    </>
  )
}
