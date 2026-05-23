"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  BookOpen, User, MoreVertical, KeyRound, Loader2,
  ChevronRight, UserCheck, AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Child {
  _id: string
  firstName: string
  lastName: string
  username?: string
  gender?: string
  age?: number
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
}

function ParentChildrenPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChildren = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users?role=student", { credentials: "include" })
      const data = await res.json()
      if (data.success) setChildren(data.data.users)
      else toast.error(data.message)
    } catch {
      toast.error("Failed to load children")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchChildren() }, [fetchChildren])

  const credentialsSet = (child: Child) => !!child.username

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="My Children"
        subtitle={`${children.length} student${children.length !== 1 ? "s" : ""} registered`}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No students found</p>
            <p className="text-gray-400 text-sm mt-1">
              Contact your admin to add students to your account.
            </p>
          </div>
        ) : (
          <>
            {/* Notice banner for students missing credentials */}
            {children.some((c) => !credentialsSet(c)) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Action required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Some of your children need login credentials. Click "Set credentials" to give them access.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {children.map((child) => {
                const hasCredentials = credentialsSet(child)
                const initials = `${child.firstName[0]}${child.lastName[0]}`.toUpperCase()
                return (
                  <div
                    key={child._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-secondary">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">
                          {child.firstName} {child.lastName}
                        </p>
                        {child.isActive ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Inactive</span>
                        )}
                      </div>
                      {child.username ? (
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{child.username}</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> Login credentials not set
                        </p>
                      )}
                      {(child.gender || child.age) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {child.gender && <span className="capitalize">{child.gender}</span>}
                          {child.gender && child.age && <span> · </span>}
                          {child.age && <span>Age {child.age}</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!hasCredentials && (
                        <button
                          onClick={() => router.push(`/parent/children/${child._id}/setup`)}
                          className="text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Set credentials
                        </button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/parent/children/${child._id}/setup`)}>
                            <KeyRound className="w-3.5 h-3.5 mr-2" />
                            {hasCredentials ? "Update credentials" : "Set credentials"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default withAuth(ParentChildrenPage, ["parent"])
