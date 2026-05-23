'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { withAuth } from '@/lib/auth/AuthContext'
import { useAuth } from '@/lib/auth/AuthContext'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import {
  MessageCircle, Send, Bot, User, Headphones, RefreshCw,
  Phone, Globe, Clock, Search, XCircle, Loader2,
  ChevronRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SessionStatus = 'ai' | 'waiting' | 'live' | 'ended'

interface SessionSummary {
  sessionId: string
  status: SessionStatus
  visitorName: string
  visitorPhone: string
  visitorPage: string
  lastActivity: string
  createdAt: string
  messageCount: number
  lastMessage: { role: string; content: string; timestamp: string } | null
}

interface Message {
  role: 'visitor' | 'admin' | 'ai' | 'system'
  content: string
  timestamp: string
}

interface FullSession {
  sessionId: string
  status: SessionStatus
  visitorName: string
  visitorPhone: string
  messages: Message[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_STYLES: Record<SessionStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  live: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ai: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  ended: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_DOT: Record<SessionStatus, string> = {
  waiting: 'bg-yellow-400 animate-pulse',
  live: 'bg-green-400',
  ai: 'bg-purple-400',
  ended: 'bg-gray-400',
}

// ─── Session sidebar item ─────────────────────────────────────────────────────

function SessionItem({
  session,
  selected,
  onClick,
}: {
  session: SessionSummary
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
        selected ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${STATUS_DOT[session.status]}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {session.visitorName || 'Visitor'}
            </p>
            {session.visitorPhone && (
              <p className="text-xs text-gray-400 truncate">{session.visitorPhone}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[session.status]}`}>
            {session.status}
          </span>
          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(session.lastActivity)}</p>
        </div>
      </div>
      {session.lastMessage && (
        <p className="text-xs text-gray-400 truncate mt-1 ml-4">
          {session.lastMessage.role === 'visitor' ? '👤 ' : session.lastMessage.role === 'admin' ? '🎧 ' : ''}
          {session.lastMessage.content}
        </p>
      )}
    </button>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
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
    <div className={`flex items-end gap-2 mb-3 ${isVisitor ? 'flex-row' : 'flex-row-reverse'}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white
          ${isVisitor ? 'bg-blue-500' : msg.role === 'ai' ? 'bg-purple-600' : 'bg-green-600'}`}
      >
        {isVisitor ? <User size={14} /> : msg.role === 'ai' ? <Bot size={14} /> : <Headphones size={14} />}
      </div>
      <div className={`max-w-[72%] flex flex-col ${isVisitor ? 'items-start' : 'items-end'}`}>
        <span className="text-[10px] text-gray-400 mb-0.5 mx-1">
          {msg.role === 'visitor' ? 'Visitor' : msg.role === 'ai' ? 'AI' : 'You'} · {fmtTime(msg.timestamp)}
        </span>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isVisitor
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
              : msg.role === 'ai'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-gray-800 dark:text-gray-100 rounded-tr-sm border border-purple-100 dark:border-purple-900'
              : 'bg-blue-600 text-white rounded-tr-sm'
            }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

// Customer representative name used in greeting templates
const REPRESENTATIVE_NAME = 'Blessing'

// ─── Main Admin Chat Dashboard ────────────────────────────────────────────────

function AdminChatPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get('session')
  )
  const [activeSession, setActiveSession] = useState<FullSession | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoFilledRef = useRef<Set<string>>(new Set())

  // ── Load session list ───────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chat/sessions?status=${filter}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) setSessions(data.sessions)
    } catch {
      // Ignore
    } finally {
      setLoadingSessions(false)
    }
  }, [filter])

  useEffect(() => {
    loadSessions()
    const t = setInterval(loadSessions, 5000)
    return () => clearInterval(t)
  }, [loadSessions])

  // ── Load full session + poll ────────────────────────────────────────────
  const loadFullSession = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/chat/session/${sid}`)
      const data = await res.json()
      if (data.success) {
        setActiveSession({
          sessionId: sid,
          status: data.status,
          visitorName: data.visitorName || 'Visitor',
          visitorPhone: data.visitorPhone || '',
          messages: data.messages,
        })
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selectedId) return

    setLoadingChat(true)
    loadFullSession(selectedId).finally(() => setLoadingChat(false))

    pollRef.current = setInterval(() => loadFullSession(selectedId), 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedId, loadFullSession])

  // ── Auto-fill greeting on first admin response ─────────────────────────
  useEffect(() => {
    if (!activeSession) return
    if (activeSession.status === 'ended' || activeSession.status === 'ai') return
    // Only auto-fill if no admin message has been sent yet in this session
    const hasAdminMsg = activeSession.messages.some((m) => m.role === 'admin')
    if (hasAdminMsg) return
    // Only do it once per session (don't overwrite if admin already started typing)
    if (autoFilledRef.current.has(activeSession.sessionId)) return
    autoFilledRef.current.add(activeSession.sessionId)
    const agentName = user?.firstName || REPRESENTATIVE_NAME
    const visitorFirst = (activeSession.visitorName || 'there').split(' ')[0]
    const greeting = `Hi ${visitorFirst}! 👋 I'm ${agentName} from D-lighter Tutor's support team. I've just joined our chat — how can I help you today?`
    setInput((prev) => (prev.trim() === '' ? greeting : prev))
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [activeSession, user])

  // ── Scroll to bottom when messages change ───────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  // ── Send admin reply ────────────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    const text = input.trim()
    if (!text || !selectedId || sending) return
    setSending(true)
    setInput('')

    try {
      await fetch('/api/admin/chat/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selectedId, message: text }),
      })
      // Immediately refresh the chat
      await loadFullSession(selectedId)
    } catch {
      // Ignore
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, selectedId, sending, loadFullSession])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  const filteredSessions = sessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.visitorName?.toLowerCase().includes(q) ||
      s.visitorPhone?.includes(q) ||
      s.sessionId.toLowerCase().includes(q)
    )
  })

  const activeCount = sessions.filter((s) => s.status === 'waiting' || s.status === 'live').length
  const canReply = activeSession && activeSession.status !== 'ended' && activeSession.status !== 'ai'

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Support Chat"
        subtitle="Manage live visitor conversations"
        actions={
          <button
            onClick={() => { setLoadingSessions(true); loadSessions() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={14} className={loadingSessions ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />
      <div className="flex flex-1 overflow-hidden">
      {/* ── Session list panel ── */}
      <div className="w-72 xl:w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Panel header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Live Chat</h2>
              <p className="text-xs text-gray-400">
                {activeCount} active · {sessions.length} total
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setLoadingSessions(true); loadSessions() }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} className={loadingSessions ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-gray-100 rounded-xl p-0.5 mb-3 text-xs font-medium">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 py-1 rounded-lg transition-colors ${filter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              All
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {loadingSessions && sessions.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
              <MessageCircle size={24} />
              <span className="text-sm">{filter === 'active' ? 'No active chats' : 'No sessions found'}</span>
            </div>
          ) : (
            filteredSessions.map((s) => (
              <SessionItem
                key={s.sessionId}
                session={s}
                selected={s.sessionId === selectedId}
                onClick={() => setSelectedId(s.sessionId)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      {!selectedId ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <MessageCircle size={28} className="text-secondary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-700">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeCount > 0 ? `${activeCount} visitor${activeCount > 1 ? 's are' : ' is'} waiting` : 'No active chats right now'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setSelectedId(null)}
              className="md:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {activeSession?.visitorName || 'Visitor'}
                </p>
                {activeSession && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[activeSession.status]}`}>
                    {activeSession.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                {activeSession?.visitorPhone && (
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    {activeSession.visitorPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Globe size={10} />
                  {selectedId}
                </span>
              </div>
            </div>
            {activeSession?.status === 'waiting' && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 animate-pulse flex items-center gap-1">
                <Clock size={12} />
                Waiting for reply
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: 'oklch(0.975 0.003 250)' }}>
            {loadingChat ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Loading messages…</span>
              </div>
            ) : activeSession?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet
              </div>
            ) : (
              activeSession?.messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {canReply ? (
            <div className="flex flex-col flex-shrink-0">
              {/* Commands reference bar */}
              <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
                <span className="font-semibold text-gray-500">Commands:</span>
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono font-medium text-gray-600">END</span>
                <span>— end &amp; close the conversation</span>
              </div>
              <div className="px-4 py-3 bg-white flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                rows={1}
                maxLength={2000}
                autoFocus
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 text-sm px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/30 max-h-36 overflow-y-auto leading-relaxed"
                style={{ minHeight: '42px' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 144) + 'px'
                }}
              />
              <button
                onClick={sendReply}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white flex-shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
              </div>
            </div>
          ) : activeSession?.status === 'ended' ? (
            <div className="px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle size={16} />
                <span className="text-sm">This session has ended.</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </div>
  )
}

export default withAuth(AdminChatPage, ["admin", "super_admin"])
