"use client"

import { useState, useEffect, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft, Loader2, GraduationCap, User, BookOpen, Shield, Plus, X } from "lucide-react"
import { withAuth } from "@/lib/auth/AuthContext"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const PRESET_SUBJECTS = [
  "Mathematics",
  "English",
  "Verbal & Non-Verbal Reasoning",
  "Biology",
  "Chemistry",
  "Physics",
  "ICT",
  "Yoruba",
  "Igbo",
  "French",
  "Coding",
  "Graphics",
  "Animation",
  "Music Lessons",
]

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  tutor: "Tutor",
  parent: "Parent",
  student: "Student",
}

const ROLE_ICONS: Record<string, any> = {
  admin: Shield,
  tutor: GraduationCap,
  parent: User,
  student: BookOpen,
}

interface ParentOption {
  _id: string
  firstName: string
  lastName: string
  email: string
}

function CreateUserPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const basePath = pathname.startsWith("/super-admin") ? "/super-admin" : "/admin"

  const [form, setForm] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    parentId: "",
  })
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [customSubjectInput, setCustomSubjectInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [parents, setParents] = useState<ParentOption[]>([])
  const [parentsLoading, setParentsLoading] = useState(false)

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  const addCustomSubject = () => {
    const trimmed = customSubjectInput.trim()
    if (!trimmed) return
    if (selectedSubjects.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setCustomSubjectInput("")
      return
    }
    setSelectedSubjects((prev) => [...prev, trimmed])
    setCustomSubjectInput("")
  }

  const isStudent = role === "student"
  const Icon = ROLE_ICONS[role] ?? User

  // Fetch parents list for student form
  useEffect(() => {
    if (!isStudent) return
    setParentsLoading(true)
    fetch("/api/admin/users?role=parent&limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setParents(data.data.users)
      })
      .catch(() => {})
      .finally(() => setParentsLoading(false))
  }, [isStudent])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body: Record<string, any> = { role }
      if (!isStudent) {
        body.firstName = form.firstName
        body.lastName = form.lastName
        body.email = form.email
        if (form.phone) body.phone = form.phone
        if (role === "tutor") {
          body.subjects = selectedSubjects
        }
      } else {
        body.firstName = form.firstName
        body.lastName = form.lastName
        body.parentId = form.parentId
        if (form.gender) body.gender = form.gender
        if (form.age) body.age = parseInt(form.age)
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`${ROLE_LABELS[role]} created successfully`, {
          description: isStudent
            ? `Username: ${data.data?.username ?? "Generated"}. Ask the parent to set login credentials.`
            : "Login credentials have been sent to their email.",
        })
        router.push(`${basePath}/users`)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!ROLE_LABELS[role]) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500">
        <p>Invalid role: <span className="font-mono">{role}</span></p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-secondary hover:underline">Go back</button>
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
            <Icon className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Add {ROLE_LABELS[role]}</h1>
            <p className="text-xs text-gray-400">Fill in the details below</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Student — parent selection */}
            {isStudent && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Parent <span className="text-red-500">*</span>
                </label>
                {parentsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading parents…
                  </div>
                ) : parents.length === 0 ? (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    No parents found. Please{" "}
                    <button type="button" onClick={() => router.push(`${basePath}/users/new/parent`)} className="underline font-medium">
                      create a parent
                    </button>{" "}
                    first.
                  </div>
                ) : (
                  <select
                    name="parentId"
                    value={form.parentId}
                    onChange={handleChange}
                    required
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white"
                  >
                    <option value="">Select parent…</option>
                    {parents.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName} — {p.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            {/* Email — not for students */}
            {!isStudent && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="rounded-xl border-gray-200"
                />
              </div>
            )}

            {/* Phone — not for students */}
            {!isStudent && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+234 801 234 5678"
                  className="rounded-xl border-gray-200"
                />
              </div>
            )}

            {/* Student-specific fields */}
            {isStudent && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white"
                  >
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Age</label>
                  <Input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g. 12"
                    min={1}
                    max={25}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* Tutor subjects */}
            {role === "tutor" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Subjects
                </label>

                {/* Preset checkboxes */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                  {PRESET_SUBJECTS.map((subject) => {
                    const checked = selectedSubjects.includes(subject)
                    return (
                      <label
                        key={subject}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <div
                          onClick={() => toggleSubject(subject)}
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                            checked
                              ? "bg-secondary border-secondary"
                              : "border-gray-300 group-hover:border-secondary/60"
                          }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span
                          onClick={() => toggleSubject(subject)}
                          className={`text-sm select-none ${
                            checked ? "text-gray-900 font-medium" : "text-gray-600"
                          }`}
                        >
                          {subject}
                        </span>
                      </label>
                    )
                  })}
                </div>

                {/* Custom subject adder */}
                <div className="flex gap-2 mt-1">
                  <Input
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSubject() } }}
                    placeholder="Add another subject…"
                    className="rounded-xl border-gray-200 h-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    disabled={!customSubjectInput.trim()}
                    className="px-3 h-9 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold hover:bg-secondary/20 disabled:opacity-40 transition-colors flex-shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Custom subject chips */}
                {selectedSubjects.filter((s) => !PRESET_SUBJECTS.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedSubjects
                      .filter((s) => !PRESET_SUBJECTS.includes(s))
                      .map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium"
                        >
                          {s}
                          <button type="button" onClick={() => setSelectedSubjects((p) => p.filter((x) => x !== s))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                {selectedSubjects.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}

            {/* Info box */}
            {isStudent ? (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1">
                <p className="font-semibold">After creating:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>A username (DLT-…) will be auto-generated</li>
                  <li>The parent can set the student's login password from their dashboard</li>
                  <li>Admins can also set credentials from the user profile</li>
                </ul>
              </div>
            ) : (
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                Login credentials and a temporary password will be sent to the user's email. They will be required to change their password on first login.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isStudent && parents.length === 0)}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-secondary hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating {ROLE_LABELS[role]}…</>
              ) : (
                <><Plus className="w-4 h-4" /> Create {ROLE_LABELS[role]}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CreateUserPage, ["admin", "super_admin"])
