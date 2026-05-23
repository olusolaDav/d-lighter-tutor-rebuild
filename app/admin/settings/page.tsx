"use client"

import { useState } from "react"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, User, CheckCircle2, AlertCircle } from "lucide-react"

function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [saving2FA, setSaving2FA] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const toggle2FA = async (enabled: boolean) => {
    setSaving2FA(true)
    setMsg(null)
    try {
      const res = await fetch("/api/auth/settings/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      })
      const data = await res.json()
      setMsg({ text: data.message, ok: data.success })
      if (data.success) refreshUser()
    } catch {
      setMsg({ text: "Network error. Please try again.", ok: false })
    } finally {
      setSaving2FA(false)
    }
  }

  const roleDisplay = user?.role?.replace(/_/g, " ")

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Settings"
        subtitle="Manage your account and security preferences"
      />

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-4">

          {msg && (
            <Alert
              className={`rounded-2xl border-0 ${
                msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}
            >
              {msg.ok
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                : <AlertCircle className="h-4 w-4 text-red-600" />
              }
              <AlertDescription className="font-medium">{msg.text}</AlertDescription>
            </Alert>
          )}

          {/* Account info */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 pt-5 px-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base">Account Information</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Your profile details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 sm:px-6 pb-5">
              <div className="space-y-0 divide-y divide-gray-50">
                {[
                  { label: "Full Name", value: `${user?.firstName} ${user?.lastName}` },
                  { label: "Email Address", value: user?.email },
                  { label: "Role", value: roleDisplay },
                  { label: "Account Status", value: user?.isEmailVerified ? "Verified" : "Unverified" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm font-semibold text-gray-900 capitalize ${
                      row.label === "Account Status" && user?.isEmailVerified
                        ? "text-emerald-600"
                        : ""
                    }`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3 pt-5 px-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Require an email OTP each time you log in
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 sm:px-6 pb-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div>
                  <Label htmlFor="2fa-toggle" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    {user?.twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                  </Label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {user?.twoFactorEnabled
                      ? "You'll be asked for an OTP on every login."
                      : "Enable for an extra layer of security."}
                  </p>
                </div>
                {saving2FA ? (
                  <Loader2 className="animate-spin w-5 h-5 text-secondary" />
                ) : (
                  <Switch
                    id="2fa-toggle"
                    checked={user?.twoFactorEnabled ?? false}
                    onCheckedChange={toggle2FA}
                    className="data-[state=checked]:bg-secondary"
                  />
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage, ["admin", "super_admin", "student", "parent"])
