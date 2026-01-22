import type { Metadata } from "next"
import { AuthProvider } from "@/lib/auth/AuthContext"

export const metadata: Metadata = {
  title: "Admin Dashboard | D-lighter Tutor",
  description: "Admin panel for D-lighter Tutor lead management and analytics",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}