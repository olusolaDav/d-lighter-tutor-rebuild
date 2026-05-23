"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, GraduationCap, User, BookOpen, Shield } from "lucide-react"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"

const ALL_ROLES = [
  {
    role: "parent",
    label: "Parent",
    description: "Register a parent. Students can be added under their parent account.",
    icon: User,
    color: "text-green-600",
    bg: "bg-green-50 hover:bg-green-100 border-green-100 hover:border-green-300",
  },
  {
    role: "tutor",
    label: "Tutor",
    description: "Register a tutor who will deliver lessons to students.",
    icon: GraduationCap,
    color: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-100 hover:border-purple-300",
  },
  {
    role: "student",
    label: "Student",
    description: "Add a student under an existing parent. A parent must exist first.",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-100 hover:border-amber-300",
  },
]

const ADMIN_ROLE = {
  role: "admin",
  label: "Admin",
  description: "Create an admin who can manage parents, tutors and students.",
  icon: Shield,
  color: "text-blue-600",
  bg: "bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-300",
}

function ChooseRolePage() {
  const router = useRouter()
  const { user } = useAuth()
  const roles = user?.role === "super_admin" ? [ADMIN_ROLE, ...ALL_ROLES] : ALL_ROLES

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
        <div>
          <h1 className="text-base font-bold text-gray-900">Add New User</h1>
          <p className="text-xs text-gray-400">Choose the type of user to create</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-xl mx-auto mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Select User Role</h2>
          <p className="text-sm text-gray-500 mb-6">Select the role for the new user you want to add to the system.</p>

          <div className="space-y-3">
            {roles.map(({ role, label, description, icon: Icon, color, bg }) => (
              <button
                key={role}
                onClick={() => router.push(`/admin/users/new/${role}`)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${bg}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(ChooseRolePage, ["admin", "super_admin"])
