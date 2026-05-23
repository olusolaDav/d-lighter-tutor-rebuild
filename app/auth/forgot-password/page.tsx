"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage({ text: data.message, ok: data.success })
    } catch {
      setMessage({ text: "Network error. Please try again.", ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Reset your password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send a reset code</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {message && (
          <Alert variant={message.ok ? "default" : "destructive"} className="mb-5">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-12"
          />
          <Button type="submit" className="w-full h-12" disabled={loading || !email}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {loading ? "Sending…" : "Send Reset Code"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-primary hover:underline">← Back to login</Link>
        </p>
      </CardContent>
    </Card>
  )
}
