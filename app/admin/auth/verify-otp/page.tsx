"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface VerifyOTPError {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
}

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<VerifyOTPError | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = searchParams.get('email')
  const purpose = searchParams.get('purpose')
  const firstName = searchParams.get('firstName')

  // Redirect if no email or purpose
  useEffect(() => {
    if (!email || !purpose) {
      router.push('/admin/auth/login')
      return
    }

    // Set up timer for OTP expiration
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

  const handleOTPInputChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^[0-9]$/.test(value) && value !== '') return
    
    const newOtpInputs = [...otpInputs]
    newOtpInputs[index] = value
    setOtpInputs(newOtpInputs)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    if (error) setError(null)
  }
  
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text')
    
    // Extract only digits from pasted content
    const digits = pasteData.replace(/\D/g, '')
    
    if (digits.length === 6) {
      const newOtpInputs = digits.split('').slice(0, 6)
      setOtpInputs(newOtpInputs)
      
      // Focus the last input box
      inputRefs.current[5]?.focus()
      
      // Clear any errors
      if (error) setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otpInputs.join('')
    if (otpCode.length !== 6) {
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
          otp: otpCode,
          purpose,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError({ 
          message: 'Verification successful!', 
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
        message: 'Network error. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError(null)
    setResendCooldown(60) // 1 minute cooldown

    try {
      const response = await fetch('/api/admin/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError({ 
          message: 'Verification code sent successfully!',
          type: 'success'
        })
        setTimeLeft(600) // Reset timer to 10 minutes
        setOtpInputs(['', '', '', '', '', '']) // Clear inputs
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

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white rounded-xl">
      <CardHeader className="space-y-4 text-center pb-8 pt-8">
        <CardTitle className="text-3xl font-bold text-gray-900">
          Enter 6-digit Code
        </CardTitle>
        <CardDescription className="text-gray-500 text-base">
          We have sent a verification code to your email:
        </CardDescription>
        <div className="text-blue-600 font-medium">
          {email}
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {error && (
          <Alert variant={error.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-3">
            {otpInputs.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPInputChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                onPaste={handleOTPPaste}
                className="w-12 h-12 text-center text-xl font-semibold bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all duration-200 rounded-lg"
                disabled={loading}
              />
            ))}
          </div>
          
          <div className="text-center space-y-4">
            {resendCooldown > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend Code {String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:{String(resendCooldown % 60).padStart(2, '0')}
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                {resendLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Resend Code'
                )}
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={otpInputs.join('').length !== 6 || loading}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white rounded-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}