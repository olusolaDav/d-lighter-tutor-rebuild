"use client"

import { Bell, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  const { user } = useAuth()

  const settingsPath =
    user?.role === "super_admin"
      ? "/super-admin/settings"
      : user?.role === "admin"
      ? "/admin/settings"
      : user?.role === "student"
      ? "/student/profile"
      : "/parent/profile"

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`

  return (
    <header className="flex items-center justify-between pl-16 lg:pl-6 pr-4 sm:pr-6 py-4 bg-white border-b border-gray-100 flex-shrink-0 gap-4">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

        <Link href={settingsPath}>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-secondary hover:bg-secondary/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-xl text-gray-400 hover:text-secondary hover:bg-secondary/10 relative"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.09 248), oklch(0.35 0.09 248))",
          }}
          title={`${user?.firstName} ${user?.lastName}`}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
