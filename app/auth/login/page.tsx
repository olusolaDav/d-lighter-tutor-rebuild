"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ identifier: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isUsername = formData.identifier.toUpperCase().startsWith("DLT-")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const body = isUsername
        ? { username: formData.identifier, password: formData.password }
        : { email: formData.identifier, password: formData.password }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await res.json()

      if (data.success) {
        if (data.data?.mustChangePassword) {
          toast.warning("Please change your password to continue", { duration: 4000 })
          window.location.href = "/auth/change-password"
        } else if (data.data?.requiresOTP) {
          const params = new URLSearchParams({
            email: data.data.email,
            purpose: "login_verification",
            firstName: data.data.firstName,
          })
          router.push(`/auth/verify-otp?${params}`)
        } else {
          toast.success(data.message)
          window.location.href = data.data?.redirectTo ?? "/auth/login"
        }
      } else {
        if (res.status === 423) {
          toast.warning(data.message)
        } else {
          toast.error(data.message)
        }
      }
    } catch {
      toast.error("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
        <CardDescription className="text-gray-500">
          {isUsername ? "Signing in as student" : "Sign in to your account"}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="identifier"
            type="text"
            placeholder="Email address or student username (DLT-…)"
            value={formData.identifier}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12"
            autoComplete="username"
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!isUsername && (
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-secondary hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white"
            disabled={loading || !formData.identifier || !formData.password}
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Admin or staff?{" "}
          <Link href="/auth/register-super-admins" className="text-secondary hover:underline font-medium">
            System registration
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
