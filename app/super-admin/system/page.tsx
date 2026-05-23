"use client"

import { withAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ShieldCheck, Users, Database, Activity, Server,
  Key, AlertTriangle, CheckCircle2, RefreshCw, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"

interface SystemStats {
  counts: Record<string, { total: number; active: number }>
  totalUsers: number
  superAdminSlots: { used: number; max: number }
  recentUsers: Array<{
    _id: string; firstName: string; lastName: string
    role: string; createdAt: string; isActive: boolean
  }>
}

function SystemPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadStats() {
    try {
      const res = await fetch('/api/super-admin/stats')
      const data = await res.json()
      if (data.success) setStats(data.data)
      else toast.error('Failed to load system stats')
    } catch {
      toast.error('Network error loading system stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  function handleRefresh() {
    setRefreshing(true)
    loadStats()
  }

  const superAdminList = stats?.recentUsers.filter(u => u.role === 'super_admin') ?? []
  const slotsUsed = stats?.superAdminSlots.used ?? 0
  const slotsMax = stats?.superAdminSlots.max ?? 2

  const statRows = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—' },
    { label: 'Admins', value: stats?.counts.admin?.total ?? '—' },
    { label: 'Tutors', value: stats?.counts.tutor?.total ?? '—' },
    { label: 'Parents', value: stats?.counts.parent?.total ?? '—' },
    { label: 'Students', value: stats?.counts.student?.total ?? '—' },
  ]

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="System Overview"
        subtitle="Platform health and administrative controls"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* Super Admin Slots */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Super Admin Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {Array.from({ length: slotsMax }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      i < slotsUsed
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {i < slotsUsed ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {slotsUsed} / {slotsMax} slots used
                </p>
                {slotsUsed >= slotsMax && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    Maximum super admins reached. No new registrations allowed.
                  </p>
                )}
                {slotsUsed < slotsMax && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {slotsMax - slotsUsed} slot{slotsMax - slotsUsed > 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Registration Key
              </p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <Key className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <code className="text-sm text-gray-700 font-mono flex-1">
                  {process.env.NEXT_PUBLIC_SHOW_SUPER_KEY === 'true'
                    ? process.env.NEXT_PUBLIC_SUPER_ADMIN_REGISTER_KEY
                    : '••••••••••••••••••••'}
                </code>
                <Badge variant="outline" className="text-xs">env variable</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Set <code className="bg-gray-100 px-1 rounded">SUPER_ADMIN_REGISTER_KEY</code> in your environment.
                Share only with trusted personnel.
              </p>
            </div>

            {slotsUsed < slotsMax && (
              <div>
                <Link href="/auth/register-super-admins" target="_blank">
                  <Button size="sm" className="gap-2 bg-secondary hover:bg-secondary/90 text-white">
                    <ExternalLink className="w-4 h-4" />
                    Open Registration Page
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-8 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {statRows.map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Link href="/super-admin/users" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <Users className="w-4 h-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/super-admin/leads" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <Activity className="w-4 h-4" />
                  View Leads
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats ? 'bg-emerald-500' : loading ? 'bg-amber-400' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-700">
                {loading ? 'Checking connection…' : stats ? 'Connected' : 'Connection error'}
              </span>
            </div>
            <p className="text-xs text-gray-400">MongoDB Atlas — queries are routed through the API layer</p>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-gray-600" />
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Node Environment', value: process.env.NODE_ENV ?? 'unknown' },
                { label: 'Framework', value: 'Next.js (App Router)' },
                { label: 'Auth', value: 'JWT — HTTP-only cookies' },
                { label: 'Email Provider', value: 'ZeptoMail SMTP' },
                { label: 'Messaging', value: 'Green API (WhatsApp)' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <Badge variant="outline" className="text-xs font-mono">{row.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default withAuth(SystemPage, ["super_admin"])
