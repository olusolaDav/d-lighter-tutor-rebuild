"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const ROLE_ROUTES: Record<string, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  student: "/student",
  parent: "/parent",
}

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email")
  const purpose = searchParams.get("purpose")
  const firstName = searchParams.get("firstName")
  const role = searchParams.get("role")

  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<{ message: string; type: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(600)
  const [resendCooldown, setResendCooldown] = useState(0)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email || !purpose) router.push("/auth/login")
  }, [email, purpose, router])

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p <= 0 ? (clearInterval(t), 0) : p - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]$/.test(val) && val !== "") return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
    if (error) setError(null)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (raw.length === 6) {
      setDigits(raw.split(""))
      refs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join("")
    if (otp.length !== 6) return setError({ message: "Enter all 6 digits", type: "error" })

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
        credentials: "include",
      })
      const data = await res.json()

      if (data.success) {
        setError({ message: "Verification successful!", type: "success" })

        setTimeout(() => {
          if (purpose === "email_verification") {
            router.push("/auth/login?verified=1")
          } else if (purpose === "login_verification") {
            const dest = data.data?.redirectTo ?? (role ? ROLE_ROUTES[role] : "/auth/login")
            window.location.href = dest
          } else if (purpose === "password_reset") {
            const params = new URLSearchParams({
              token: data.data.resetToken,
              email: email!,
            })
            router.push(`/auth/reset-password?${params}`)
          } else {
            router.push("/auth/login")
          }
        }, 1200)
      } else {
        setError({ message: data.message, type: "error" })
      }
    } catch {
      setError({ message: "Network error. Please try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendCooldown(60)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      })
      setTimeLeft(600)
      setDigits(["", "", "", "", "", ""])
      setError({ message: "New code sent!", type: "success" })
    } finally {
      setResendLoading(false)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Verify your email</CardTitle>
        <CardDescription>
          {firstName ? `Hi ${firstName}, enter` : "Enter"} the 6-digit code sent to{" "}
          <span className="font-medium text-gray-800">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {error && (
          <Alert
            variant={error.type === "error" ? "destructive" : "default"}
            className={`mb-5 ${error.type === "success" ? "border-green-400 bg-green-50 text-green-800" : ""}`}
          >
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <Input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold"
                disabled={loading}
              />
            ))}
          </div>

          <div className="text-center text-sm text-gray-500">
            {timeLeft > 0 ? (
              <span>Code expires in <span className="font-medium text-gray-800">{fmt(timeLeft)}</span></span>
            ) : (
              <span className="text-red-500">Code expired. Please request a new one.</span>
            )}
          </div>

          <Button type="submit" className="w-full h-12" disabled={loading || digits.join("").length !== 6}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {loading ? "Verifying…" : "Verify Code"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendLoading
              ? "Sending…"
              : "Resend code"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/auth/login" className="text-primary hover:underline">
            ← Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPContent />
    </Suspense>
  )
}
