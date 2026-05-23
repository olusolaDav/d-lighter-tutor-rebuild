"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get("token") ?? ""

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      return setMessage({ text: "Passwords do not match.", ok: false })
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, ...form }),
      })
      const data = await res.json()
      setMessage({ text: data.message, ok: data.success })
      if (data.success) setTimeout(() => router.push("/auth/login"), 2000)
    } catch {
      setMessage({ text: "Network error. Please try again.", ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {message && (
          <Alert variant={message.ok ? "default" : "destructive"} className="mb-5">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              name="newPassword"
              type={showPw ? "text" : "password"}
              placeholder="New password"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Input
            name="confirmPassword"
            type={showPw ? "text" : "password"}
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="h-12"
          />
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-primary hover:underline">← Back to login</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordContent /></Suspense>
}
