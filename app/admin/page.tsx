"use client"

import { useState, useEffect } from "react"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users2,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Loader2,
  ArrowUpRight,
  Clock,
  PhoneCall,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Stats {
  total: number
  byStatus: { new: number; contacted: number; converted: number; closed: number }
  todayLeads: number
  weekLeads: number
  conversionRate: string | number
}

const STATUS_META = {
  new: { label: "New", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", icon: PhoneCall, color: "text-amber-600", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  converted: { label: "Converted", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", icon: XCircle, color: "text-gray-500", bg: "bg-gray-100", badge: "bg-gray-100 text-gray-600" },
}

function AdminOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leads?limit=0")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data.stats) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={`${greeting()}, ${user?.firstName}!`}
        subtitle="Here's your dashboard overview for today"
        actions={
          <Link href="/admin/leads">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white rounded-lg gap-1.5">
              <Users2 className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Leads</span>
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin w-8 h-8 text-secondary" />
              <p className="text-sm text-gray-400">Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero stat */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, oklch(0.45 0.09 248) 0%, oklch(0.30 0.07 248) 100%)" }}
            >
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "url('/doodle_blue.png')", backgroundSize: "600px", backgroundRepeat: "repeat" }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Total Leads</p>
                  <p className="text-5xl font-extrabold">{stats?.total ?? 0}</p>
                  <p className="text-white/70 text-sm mt-2">
                    <span className="text-white font-semibold">+{stats?.todayLeads ?? 0}</span> today ·{" "}
                    <span className="text-white font-semibold">{stats?.weekLeads ?? 0}</span> this week
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold text-sm">{stats?.conversionRate ?? 0}%</span>
                    <span className="text-white/70 text-sm">conversion rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {(["new", "contacted", "converted", "closed"] as const).map((status) => {
                const meta = STATUS_META[status]
                const count = stats?.byStatus[status] ?? 0
                const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0
                return (
                  <Card key={status} className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
                          <meta.icon className={`w-5 h-5 ${meta.color}`} />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                          {pct}%
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{meta.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-sm font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-2">
                  {[
                    { href: "/admin/leads", label: "View all leads", icon: Users2, color: "text-secondary" },
                    { href: "/admin/chat", label: "Open support chat", icon: MessageCircle, color: "text-emerald-600" },
                    { href: "/admin/blog", label: "Manage blog posts", icon: TrendingUp, color: "text-amber-600" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-sm font-semibold text-gray-900">Lead Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {(["new", "contacted", "converted", "closed"] as const).map((status) => {
                    const meta = STATUS_META[status]
                    const count = stats?.byStatus[status] ?? 0
                    const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">{meta.label}</span>
                          <span className="text-xs font-semibold text-gray-900">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              status === "new" ? "bg-blue-400" :
                              status === "contacted" ? "bg-amber-400" :
                              status === "converted" ? "bg-emerald-400" : "bg-gray-300"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default withAuth(AdminOverviewPage, ["admin", "super_admin"])
