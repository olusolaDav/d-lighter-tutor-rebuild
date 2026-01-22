"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, Loader2, Shield } from "lucide-react"

interface LoginFormData {
  email: string
  password: string
}

interface LoginError {
  message: string
  type?: 'error' | 'warning' | 'info'
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        if (data.data.requiresOTP) {
          // Redirect to OTP verification page
          const queryParams = new URLSearchParams({
            email: data.data.email,
            purpose: 'login_verification',
            firstName: data.data.firstName,
          })
          router.push(`/admin/auth/verify-otp?${queryParams}`)
        } else {
          // Direct login success (shouldn't happen with current implementation)
          router.push('/admin')
        }
      } else {
        setError({ 
          message: data.message,
          type: response.status === 423 ? 'warning' : 'error'
        })
      }
    } catch (error) {
      setError({ 
        message: 'Network error. Please check your connection and try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.email && formData.password

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to your admin account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant={error.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-800">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@d-lightertutor.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-800">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full h-12 bg-gradient-to-r from-secondary via-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/admin/auth/forgot-password"
            className="text-sm text-secondary hover:text-secondary/80 font-semibold hover:underline transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an admin account?{" "}
            <Link
              href="/admin/auth/register"
              className="text-secondary hover:text-secondary/80 font-semibold hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Secured with 2-Factor Authentication</span>
        </div>
      </CardFooter>
    </Card>
  )
}