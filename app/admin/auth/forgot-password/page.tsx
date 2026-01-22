"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, ArrowLeft, Key } from "lucide-react"

interface ForgotPasswordError {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ForgotPasswordError | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError({ message: 'Please enter a valid email address', type: 'error' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsEmailSent(true)
        setError({ 
          message: 'If an admin account exists with this email, you will receive a password reset code shortly.',
          type: 'success'
        })
        
        // Auto-redirect to OTP verification after a short delay
        setTimeout(() => {
          const queryParams = new URLSearchParams({
            email: email,
            purpose: 'password_reset',
          })
          router.push(`/admin/auth/verify-otp?${queryParams}`)
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

  const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (isEmailSent) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a password reset code to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="default" className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">
                A 6-digit verification code has been sent to:
              </p>
              <p className="font-medium text-gray-900 mt-1">{email}</p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Check your inbox and spam folder</p>
              <p>• The code expires in 10 minutes</p>
              <p>• You'll be redirected to verification shortly</p>
            </div>
          </div>

          <Button
            onClick={() => {
              const queryParams = new URLSearchParams({
                email: email,
                purpose: 'password_reset',
              })
              router.push(`/admin/auth/verify-otp?${queryParams}`)
            }}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            Enter Verification Code
          </Button>
        </CardContent>

        <CardFooter className="text-center pt-6 border-t border-gray-100">
          <Link
            href="/admin/auth/login"
            className="text-sm text-gray-600 hover:text-gray-700 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-accent rounded-full flex items-center justify-center shadow-lg">
          <Key className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-gray-600">
          No worries! We'll send you a verification code to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && error.type !== 'success' && (
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
                placeholder="Enter your admin email address"
                value={email}
                onChange={handleEmailChange}
                className="pl-10 h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500">
              We'll send a verification code to this email address
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isEmailValid || loading}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-accent hover:from-orange-600 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Security Notice</p>
              <p className="mt-1">
                For security reasons, we'll send the reset code to the email address 
                associated with your admin account. If you don't receive the email, 
                please check your spam folder.
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

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an admin account?{" "}
            <Link
              href="/admin/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}