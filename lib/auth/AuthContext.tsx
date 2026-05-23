"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'super_admin' | 'admin' | 'tutor' | 'student' | 'parent'

export interface AuthUser {
  adminId: string
  email?: string
  username?: string           // for students
  firstName: string
  lastName: string
  role: UserRole
  permissions: string[]
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  mustChangePassword: boolean
  lastLogin?: string
  profileImage?: string
  parentId?: string           // for students
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; data?: any }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  refreshUser: () => Promise<boolean>
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
  parent: '/parent',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
          return true
        }
      }
      setUser(null)
      return false
    } catch {
      setUser(null)
      return false
    }
  }, [])

  const refreshUser = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
          return true
        }
      }
      return await refreshToken()
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [refreshToken])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await response.json()
      return data
    } catch {
      return { success: false, message: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    } finally {
      setUser(null)
      router.push('/auth/login')
    }
  }

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Auto-refresh access token every 12 minutes
  useEffect(() => {
    if (!user) return
    const interval = setInterval(refreshToken, 12 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user, refreshToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshToken,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/** HOC: shows spinner while loading, redirects to /auth/login if unauthenticated.
 *  Optionally pass allowed roles — wrong-role users are redirected to their dashboard. */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (loading) return
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        window.location.href = ROLE_ROUTES[user.role]
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )
    }

    if (!user) return null
    if (allowedRoles && !allowedRoles.includes(user.role)) return null

    return <Component {...props} />
  }
}
