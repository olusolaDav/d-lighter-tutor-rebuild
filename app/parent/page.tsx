"use client"

import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"

function ParentDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={`Hello, ${user?.firstName}!`}
        subtitle="Manage your children's tutoring"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { href: "/parent/children", label: "Children", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/parent/sessions", label: "Sessions", icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
            { href: "/parent/progress", label: "Progress", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
            { href: "/parent/billing", label: "Billing", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center justify-center py-16 text-gray-400">
            <p>Children overview and session summary will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ParentDashboardPage, ["parent"])
