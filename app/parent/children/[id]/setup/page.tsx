"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, KeyRound, CheckCircle } from "lucide-react"
import { withAuth } from "@/lib/auth/AuthContext"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface StudentInfo {
  firstName: string
  lastName: string
  username?: string
  age?: number
  gender?: string
}

function SetCredentialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/users/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const u = data.data
          setStudent(u)
          setForm((p) => ({ ...p, username: u.username ?? "" }))
        } else {
          toast.error(data.message)
          router.back()
        }
      })
      .catch(() => { toast.error("Failed to load student"); router.back() })
      .finally(() => setLoadingStudent(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}/set-credentials`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username || undefined, password: form.password }),
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Login credentials set!", {
          description: `${student?.firstName} can now log in with username ${data.data?.username ?? form.username}`,
        })
        setDone(true)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingStudent) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Credentials set!</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          {student?.firstName} can now log in with their username and password.
        </p>
        <div className="mt-3 bg-gray-50 rounded-xl px-5 py-3 text-sm font-mono text-gray-700">
          {form.username}
        </div>
        <button
          onClick={() => router.push("/parent/children")}
          className="mt-6 px-6 py-2.5 bg-secondary text-white text-sm font-semibold rounded-xl hover:bg-secondary/90 transition-colors"
        >
          Back to children
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Set Credentials</h1>
            <p className="text-xs text-gray-400">
              {student ? `${student.firstName} ${student.lastName}` : "Loading…"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-sm mx-auto">
          {student?.username && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4 text-xs text-blue-800">
              Current username: <span className="font-mono font-semibold">{student.username}</span>. You can update it below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Username <span className="text-gray-400 font-normal">(DLT-NAME123)</span>
              </label>
              <Input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="e.g. DLT-ADE123"
                className="rounded-xl border-gray-200 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to keep the auto-generated username.</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={show.password ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Set a password"
                  required
                  className="rounded-xl border-gray-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, password: !p.password }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={show.confirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                  required
                  className="rounded-xl border-gray-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
              When you (the parent) set the password, your child will not need to change it on first login.
            </div>

            <button
              type="submit"
              disabled={loading || !form.password || !form.confirmPassword}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-secondary hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {loading ? "Saving…" : "Save Credentials"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withAuth(SetCredentialsPage, ["parent"])
