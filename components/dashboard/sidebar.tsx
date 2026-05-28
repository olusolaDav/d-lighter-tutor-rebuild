"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth, UserRole } from "@/lib/auth/AuthContext"
import {
  LayoutDashboard,
  Users,
  Users2,
  MessageCircle,
  FileText,
  Settings,
  Calendar,
  TrendingUp,
  CreditCard,
  User,
  ShieldCheck,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/leads", label: "Enquiries", icon: Users2 },
    { href: "/admin/chat", label: "Support Chat", icon: MessageCircle },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/my-jobs", label: "Positions", icon: Briefcase },
    { href: "/admin/job-applications", label: "Applications", icon: Users2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  super_admin: [
    { href: "/super-admin", label: "Overview", icon: LayoutDashboard },
    { href: "/super-admin/users", label: "Users", icon: Users },
    { href: "/super-admin/leads", label: "Enquiries", icon: Users2 },
    { href: "/super-admin/chat", label: "Support Chat", icon: MessageCircle },
    { href: "/super-admin/blog", label: "Blog", icon: FileText },
    { href: "/super-admin/my-jobs", label: "Positions", icon: Briefcase },
    { href: "/super-admin/job-applications", label: "Applications", icon: Users2 },
    { href: "/super-admin/settings", label: "Settings", icon: Settings },
    { href: "/super-admin/system", label: "System", icon: ShieldCheck },
  ],
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/sessions", label: "My Sessions", icon: Calendar },
    { href: "/student/progress", label: "Progress", icon: TrendingUp },
    { href: "/student/subjects", label: "Subjects", icon: BookOpen },
    { href: "/student/profile", label: "Profile", icon: User },
  ],
  parent: [
    { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/children", label: "Children", icon: Users },
    { href: "/parent/sessions", label: "Sessions", icon: Calendar },
    { href: "/parent/progress", label: "Progress", icon: TrendingUp },
    { href: "/parent/billing", label: "Billing", icon: CreditCard },
    { href: "/parent/profile", label: "Profile", icon: User },
  ],
  tutor: [
    { href: "/tutor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tutor/sessions", label: "My Sessions", icon: Calendar },
    { href: "/tutor/students", label: "My Students", icon: Users },
    { href: "/tutor/subjects", label: "Subjects", icon: BookOpen },
    { href: "/tutor/profile", label: "Profile", icon: User },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin Portal",
  super_admin: "Super Admin",
  student: "Student Portal",
  parent: "Parent Portal",
  tutor: "Tutor Portal",
}

function SidebarContent({
  collapsed,
  onToggle,
  onClose,
}: {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const navItems = NAV_CONFIG[user.role] ?? []
  const roleLabel = ROLE_LABELS[user.role]

  return (
    <div className="flex flex-col h-full">
      {/* Logo area — brand gradient */}
      {collapsed ? (
        /* Collapsed logo area: icon + expand button stacked */
        <div className="flex flex-col items-center gap-2 px-2 py-4 bg-gradient-to-b from-secondary to-secondary/80">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 overflow-hidden">
            <Image src="/images/brand-logo.svg" alt="D-lighter Tutor" width={32} height={32} className="object-contain" />
          </div>
          <button
            onClick={onClose ?? onToggle}
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded logo area */
        <div className="flex items-center justify-between gap-2 px-4 py-5 bg-gradient-to-br from-secondary to-secondary/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 overflow-hidden">
              <Image src="/images/brand-logo.svg" alt="D-lighter Tutor" width={32} height={32} className="object-contain" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate">D-lighter Tutor</p>
              <p className="text-xs text-white/70 truncate">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose ?? onToggle}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label={onClose ? "Close sidebar" : "Collapse sidebar"}
          >
            {onClose ? <X className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Nav section label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Navigation</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const rootPath = user.role === "super_admin" ? "/super-admin" : `/${user.role}`
          const isActive =
            item.href === rootPath ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-secondary text-white shadow-sm shadow-secondary/30"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 w-[18px] h-[18px]",
                  isActive ? "text-white" : "text-gray-400"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, oklch(0.45 0.09 248), oklch(0.35 0.09 248))" }}
            >
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="flex-shrink-0 w-[18px] h-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/30"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 shadow-sm relative",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </aside>
    </>
  )
}


