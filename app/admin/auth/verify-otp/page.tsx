"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Clock, RefreshCw } from "lucide-react"

interface VerifyOTPError {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<VerifyOTPError | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0)

  const email = searchParams.get('email')
  const purpose = searchParams.get('purpose')
  const firstName = searchParams.get('firstName')

  useEffect(() => {
    if (!email || !purpose) {
      router.push('/admin/auth/login')
      return
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, purpose, router])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPurposeText = () => {
    switch (purpose) {
      case 'email_verification':
        return {
          title: 'Verify Your Email',
          description: 'We sent a 6-digit code to your email address',
          successMessage: 'Email verified successfully!'
        }
      case 'login_verification':
        return {
          title: 'Two-Factor Authentication',
          description: 'Enter the verification code sent to your email',
          successMessage: 'Login successful!'
        }
      case 'password_reset':
        return {
          title: 'Reset Password Verification',
          description: 'Enter the verification code to reset your password',
          successMessage: 'Verification successful!'
        }
      default:
        return {
          title: 'Verify Code',
          description: 'Enter the verification code sent to your email',
          successMessage: 'Verification successful!'
        }
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError({ message: 'Please enter a complete 6-digit code', type: 'error' })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          purpose,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError({ 
          message: getPurposeText().successMessage, 
          type: 'success' 
        })

        // Handle different purposes
        setTimeout(() => {
          switch (purpose) {
            case 'email_verification':
              router.push('/admin/auth/login')
              break
            case 'login_verification':
              router.push('/admin')
              break
            case 'password_reset':
              const resetParams = new URLSearchParams({
                token: data.data.resetToken,
                email: email!,
              })
              router.push(`/admin/auth/reset-password?${resetParams}`)
              break
            default:
              router.push('/admin/auth/login')
          }
        }, 1500)
      } else {
        setError({ 
          message: data.message,
          type: 'error'
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

  const handleResendCode = async () => {
    setResendLoading(true)
    setError(null)

    try {
      let endpoint = ''
      let body = {}

      switch (purpose) {
        case 'email_verification':
          // For email verification, we need to trigger registration flow again
          setError({ 
            message: 'Please complete registration again to resend verification code.',
            type: 'info'
          })
          setTimeout(() => router.push('/admin/auth/register'), 2000)
          return
          
        case 'login_verification':
          endpoint = '/api/admin/login'
          // We need password for login, so redirect back to login
          setError({ 
            message: 'Please log in again to receive a new verification code.',
            type: 'info'
          })
          setTimeout(() => router.push('/admin/auth/login'), 2000)
          return
          
        case 'password_reset':
          endpoint = '/api/admin/forgot-password'
          body = { email }
          break
          
        default:
          return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setError({ 
          message: 'New verification code sent to your email!',
          type: 'success'
        })
        setTimeLeft(600) // Reset timer
        setResendCooldown(60) // 1 minute cooldown
      } else {
        setError({ 
          message: data.message,
          type: 'error'
        })
      }
    } catch (error) {
      setError({ 
        message: 'Failed to resend code. Please try again.',
        type: 'error'
      })
    } finally {
      setResendLoading(false)
    }
  }

  const purposeInfo = getPurposeText()

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {purposeInfo.title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {purposeInfo.description}
        </CardDescription>
        {email && (
          <p className="text-sm text-gray-500 mt-2">
            Code sent to: <span className="font-medium">{email}</span>
          </p>
        )}
        {firstName && (
          <p className="text-sm text-gray-700">
            Hello, <span className="font-medium">{firstName}</span>!
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant={error.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-semibold text-gray-800">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOTPChange}
              className="h-12 text-center text-2xl font-mono tracking-widest bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
              disabled={loading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <Button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="w-full h-12 bg-gradient-to-r from-secondary via-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
        </form>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={resendLoading || resendCooldown > 0}
            className="text-secondary hover:text-secondary/80 border-secondary/20 hover:bg-secondary/5 transition-colors"
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <Link
            href="/admin/auth/login"
            className="text-sm text-gray-600 hover:text-gray-700 hover:underline"
          >
            ← Back to login
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Secure verification process</span>
        </div>
      </CardFooter>
    </Card>
  )
}