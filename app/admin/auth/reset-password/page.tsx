"use client"

import { useState, useEffect } from "react"
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ResetPasswordError | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const token = searchParams.get('token')
  const email = searchParams.get('email')

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

    // Check password strength
    if (name === 'newPassword') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      })
    }

    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError({ message: 'Passwords do not match', type: 'error' })
      setLoading(false)
      return
    }

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
    if (!isPasswordStrong) {
      setError({ message: 'Password does not meet the security requirements', type: 'error' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setError({ 
          message: 'Password reset successful! You can now log in with your new password.',
          type: 'success'
        })
        
        // Auto-redirect to login after a short delay
        setTimeout(() => {
          router.push('/admin/auth/login')
        }, 3000)
      } else {
        setError({ 
          message: data.message,
          type: response.status === 429 ? 'warning' : 'error'
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

  const isFormValid = formData.newPassword && 
                     formData.confirmPassword && 
                     formData.newPassword === formData.confirmPassword &&
                     Object.values(passwordStrength).every(Boolean)

  const getStrengthIndicatorColor = (condition: boolean) => 
    condition ? 'text-green-600' : 'text-red-500'

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Password Reset Successful!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && error.type === 'success' && (
            <Alert variant="default" className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">
                Your new password is now active for:
              </p>
              <p className="font-medium text-gray-900 mt-1">{email}</p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• You can now log in with your new password</p>
              <p>• Remember to keep your password secure</p>
              <p>• You'll be redirected to login shortly</p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/admin/auth/login')}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-gray-600">
          Create a new secure password for your admin account
        </CardDescription>
        {email && (
          <p className="text-sm text-gray-500 mt-2">
            Resetting password for: <span className="font-medium">{email}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && error.type !== 'success' && (
          <Alert variant={error.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-800">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Create a strong password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {formData.newPassword && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={getStrengthIndicatorColor(passwordStrength.hasMinLength)}>
                  ✓ At least 8 characters
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasUpperCase)}>
                  ✓ One uppercase letter
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasLowerCase)}>
                  ✓ One lowercase letter
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasNumber)}>
                  ✓ One number
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasSpecialChar)}>
                  ✓ One special character
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full h-12 bg-gradient-to-r from-secondary via-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Password Security Tips</p>
              <p className="mt-1">
                Choose a password that you haven't used before. Avoid using 
                personal information and consider using a password manager 
                for better security.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <Link
            href="/admin/auth/login"
            className="text-sm text-gray-600 hover:text-gray-700 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}