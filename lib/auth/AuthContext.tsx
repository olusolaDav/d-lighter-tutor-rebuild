"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Admin {
  adminId: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: string[]
  isEmailVerified: boolean
  lastLogin?: string
}

interface AuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; data?: any }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdmin(data.data)
          return true
        }
      }
      
      // Try to refresh token
      return await refreshToken()
    } catch (error) {
      console.error('Auth check failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/refresh-token', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdmin(data.data)
          return true
        }
      }
      
      setAdmin(null)
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      setAdmin(null)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      router.push('/admin/auth/login')
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Auto-refresh token every 10 minutes
  useEffect(() => {
    if (admin) {
      const interval = setInterval(() => {
        refreshToken()
      }, 10 * 60 * 1000) // 10 minutes

      return () => clearInterval(interval)
    }
  }, [admin])

  const value: AuthContextType = {
    admin,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!admin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { admin, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !admin) {
        router.push('/admin/auth/login')
      }
    }, [admin, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!admin) {
      return null
    }

    return <Component {...props} />
  }
}