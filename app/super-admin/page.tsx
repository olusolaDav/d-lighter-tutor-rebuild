"use client"

import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users, ShieldCheck, Settings, MessageCircle,
  BookOpen, FileText, TrendingUp, UserCog, GraduationCap,
  Users2, Activity, ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface StatsData {
  counts: Record<string, { total: number; active: number }>
  totalUsers: number
  superAdminSlots: { used: number; max: number }
  recentUsers: Array<{ _id: string; firstName: string; lastName: string; role: string; createdAt: string; isActive: boolean }>
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  tutor: "bg-emerald-100 text-emerald-700",
  parent: "bg-orange-100 text-orange-700",
  student: "bg-rose-100 text-rose-700",
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: UserCog,
  tutor: GraduationCap,
  parent: Users2,
  student: Users,
}

function SuperAdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/super-admin/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const roleCards = [
    { key: 'admin', label: 'Admins', icon: UserCog, color: 'text-blue-600', bg: 'bg-blue-50', href: '/super-admin/users?role=admin' },
    { key: 'tutor', label: 'Tutors', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/super-admin/users?role=tutor' },
    { key: 'parent', label: 'Parents', icon: Users2, color: 'text-orange-600', bg: 'bg-orange-50', href: '/super-admin/users?role=parent' },
    { key: 'student', label: 'Students', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50', href: '/super-admin/users?role=student' },
  ]

  const quickLinks = [
    { href: '/super-admin/users/new', label: 'Add User', icon: Users },
    { href: '/super-admin/leads', label: 'View Leads', icon: TrendingUp },
    { href: '/super-admin/chat', label: 'Support Chat', icon: MessageCircle },
    { href: '/super-admin/blog', label: 'Blog', icon: FileText },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
    { href: '/super-admin/system', label: 'System', icon: Activity },
  ]

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={`Welcome, ${user?.firstName}!`}
        subtitle="Super Admin Dashboard — full platform control"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* Super Admin Slots */}
        {stats && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Super Admin Slots</p>
                <p className="text-sm text-gray-500">
                  {stats.superAdminSlots.used} of {stats.superAdminSlots.max} slots used
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: stats.superAdminSlots.max }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i < stats.superAdminSlots.used ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Stat Cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform Users</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {roleCards.map((rc) => {
              const Icon = rc.icon
              const count = stats?.counts[rc.key]
              return (
                <Link key={rc.key} href={rc.href}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${rc.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${rc.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? '—' : count?.total ?? 0}
                      </p>
                      <p className="text-sm text-gray-500">{rc.label}</p>
                      {!loading && count && (
                        <p className="text-xs text-gray-400 mt-1">{count.active} active</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((ql) => {
              const Icon = ql.icon
              return (
                <Link key={ql.href} href={ql.href}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">{ql.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Users */}
        {stats && stats.recentUsers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recently Added Users</h2>
              <Link href="/super-admin/users">
                <Button variant="ghost" size="sm" className="text-secondary gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {stats.recentUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400">{format(new Date(u.createdAt), 'dd MMM yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs capitalize ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.role.replace('_', ' ')}
                        </Badge>
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}

export default withAuth(SuperAdminPage, ["super_admin"])
