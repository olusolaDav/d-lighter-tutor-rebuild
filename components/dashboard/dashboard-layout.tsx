"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardShell({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.975 0.003 250)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
