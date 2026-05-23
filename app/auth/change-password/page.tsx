"use client"

import { useState } from "react"
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck, Lock } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setTimeout(() => {
          window.location.href = data.data?.redirectTo ?? "/auth/login"
        }, 1500)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const PasswordField = ({
    name,
    label,
    placeholder,
    showKey,
  }: {
    name: keyof typeof form
    label: string
    placeholder: string
    showKey: keyof typeof show
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          name={name}
          type={show[showKey] ? "text" : "password"}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "oklch(0.97 0.003 250)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">D-lighter Tutor</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Change Your Password</h2>
              <p className="text-sm text-gray-500 mt-0.5">Required before accessing your dashboard</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
            🔒 Your account requires a password change for security. Please set a new password to continue.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              name="currentPassword"
              label="Current / Temporary Password"
              placeholder="Enter the password sent to you"
              showKey="current"
            />
            <PasswordField
              name="newPassword"
              label="New Password"
              placeholder="Min. 8 characters"
              showKey="new"
            />
            <PasswordField
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              showKey="confirm"
            />

            <div className="text-xs text-gray-400 space-y-1 pt-1">
              <p>Password must:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Be at least 8 characters</li>
                <li>Contain uppercase and lowercase letters</li>
                <li>Contain at least one number</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-secondary hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating password…</>
              ) : (
                "Set New Password & Continue"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
