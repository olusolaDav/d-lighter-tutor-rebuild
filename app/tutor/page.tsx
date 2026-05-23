"use client"

import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  Calendar, Users, BookOpen, TrendingUp, Clock, Star, CheckCircle,
} from "lucide-react"

const STAT_CARDS = [
  { label: "Sessions This Week", value: "0", icon: Calendar, color: "bg-blue-50 text-blue-600" },
  { label: "My Students", value: "0", icon: Users, color: "bg-purple-50 text-purple-600" },
  { label: "Subjects", value: "0", icon: BookOpen, color: "bg-amber-50 text-amber-600" },
  { label: "Sessions Completed", value: "0", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
]

function TutorOverviewPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={`Welcome, ${user?.firstName ?? "Tutor"} 👋`}
        subtitle="Here's an overview of your tutoring activity"
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-secondary" />
            <h2 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No upcoming sessions scheduled</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <h2 className="font-semibold text-gray-900 text-sm">Recent Activity</h2>
          </div>
          <div className="text-center py-8 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">Your recent sessions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(TutorOverviewPage, ["tutor"])
