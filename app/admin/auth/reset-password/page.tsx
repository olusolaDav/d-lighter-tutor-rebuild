"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Loader2, CheckCircle, ArrowLeft } from "lucide-react"

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

interface ResetPasswordError {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ResetPasswordError | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  // Redirect if no token or email
  useEffect(() => {
    if (!token || !email) {
      router.push('/admin/auth/forgot-password')
    }
  }, [token, email, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        length: password.length >= minLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        numbers: hasNumbers,
        specialChar: hasSpecialChar
      }
    }
  }

  const passwordValidation = validatePassword(formData.newPassword)
  const passwordsMatch = formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword
  const isFormValid = passwordValidation.isValid && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordValidation.isValid) {
      setError({
        message: 'Password does not meet security requirements',
        type: 'error'
      })
      return
    }

    if (!passwordsMatch) {
      setError({
        message: 'Passwords do not match',
        type: 'error'
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError({
          message: 'Password reset successful! You can now login with your new password.',
          type: 'success'
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/admin/auth/login')
        }, 3000)
      } else {
        setError({
          message: data.message || 'Failed to reset password',
          type: 'error'
        })
      }
    } catch (error) {
      setError({
        message: 'Network error. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white rounded-xl">
      <CardHeader className="space-y-4 text-center pb-8 pt-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-gray-500 text-base">
          Create a new secure password for your admin account
        </CardDescription>
        {email && (
          <p className="text-sm text-gray-500 mt-2">
            Resetting password for: <span className="font-medium">{email}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {error && (
          <Alert variant={error.type === 'error' ? 'destructive' : error.type === 'success' ? 'default' : 'default'} className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {error?.type !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-800">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="h-12 px-4 pr-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all duration-200 rounded-lg"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.newPassword && (
                <div className="text-xs space-y-1 mt-2">
                  <p className={`${passwordValidation.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ At least 8 characters
                  </p>
                  <p className={`${passwordValidation.checks.upperCase && passwordValidation.checks.lowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Contains uppercase and lowercase letters
                  </p>
                  <p className={`${passwordValidation.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Contains numbers
                  </p>
                  <p className={`${passwordValidation.checks.specialChar ? 'text-green-600' : 'text-gray-400'}`}>
                    ✓ Contains special characters
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 px-4 pr-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all duration-200 rounded-lg"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-gray-100">
              <Link
                href="/admin/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        )}

        {error?.type === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="font-semibold">Password Reset Successful!</span>
            </div>
            <p className="text-sm text-green-700">
              Your password has been reset successfully. Redirecting to login...
            </p>
            <Button
              onClick={() => router.push('/admin/auth/login')}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg"
            >
              Continue to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white rounded-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}