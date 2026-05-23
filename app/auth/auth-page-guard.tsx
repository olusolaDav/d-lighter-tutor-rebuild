"use client"

import { useEffect } from "react"
import { useAuth, ROLE_ROUTES } from "@/lib/auth/AuthContext"
import { AuthProvider } from "@/lib/auth/AuthContext"

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      const dest = ROLE_ROUTES[user.role] ?? "/auth/login"
      window.location.href = dest
    }
  }, [user, loading])

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] h-24 w-24 rounded-full bg-white/10 blur-xl animate-pulse" />
        <div className="absolute top-40 right-[15%] h-32 w-32 rounded-full bg-white/10 blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-[20%] h-20 w-20 rounded-full bg-white/10 blur-lg animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">D-lighter Tutor</h1>
          <p className="text-white/80 mt-1">Your learning portal</p>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AuthPageGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  )
}
