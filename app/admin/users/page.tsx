"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  Users, UserPlus, Search, Filter, MoreVertical, Mail, Phone,
  GraduationCap, Shield, ShieldCheck, User, BookOpen, Loader2,
  Trash2, RotateCcw, Power, ChevronLeft, ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface UserRecord {
  _id: string
  firstName: string
  lastName: string
  email?: string
  username?: string
  phone?: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  mustChangePassword: boolean
  gender?: string
  age?: number
  createdAt: string
  parentId?: { firstName: string; lastName: string; email: string }
}

const ROLE_META: Record<string, { label: string; color: string; icon: any }> = {
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800", icon: Shield },
  tutor: { label: "Tutor", color: "bg-purple-100 text-purple-800", icon: GraduationCap },
  parent: { label: "Parent", color: "bg-green-100 text-green-800", icon: User },
  student: { label: "Student", color: "bg-amber-100 text-amber-800", icon: BookOpen },
}

const TABS = [
  { key: "", label: "All Users" },
  { key: "admin", label: "Admins" },
  { key: "tutor", label: "Tutors" },
  { key: "parent", label: "Parents" },
  { key: "student", label: "Students" },
]

function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const basePath = pathname.startsWith("/super-admin") ? "/super-admin" : "/admin"
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" })
      if (activeTab) params.set("role", activeTab)
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [page, activeTab, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [activeTab, search])

  const handleAction = async (userId: string, action: string, label: string) => {
    setActionLoading(userId + action)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error(`Failed to ${label}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget._id + "delete")
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setDeleteTarget(null)
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Failed to remove user")
    } finally {
      setActionLoading(null)
    }
  }

  // Filter tabs based on role — admins can't create other admins
  const visibleTabs = user?.role === "super_admin" ? TABS : TABS.filter((t) => t.key !== "admin")

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Users"
        subtitle={`${total} total user${total !== 1 ? "s" : ""}`}
        actions={
          <Button
            size="sm"
            onClick={() => router.push(`${basePath}/users/new`)}
            className="gap-1.5 bg-secondary hover:bg-secondary/90 text-white text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add User
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex gap-1 overflow-x-auto pb-0 hide-scrollbar">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                  activeTab === tab.key
                    ? "border-secondary text-secondary"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl border-gray-200 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new user</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Details</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const meta = ROLE_META[u.role] ?? ROLE_META.admin
                      const Icon = meta.icon
                      const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
                      const displayName = `${u.firstName} ${u.lastName}`
                      return (
                        <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                                {u.username && (
                                  <p className="text-xs text-gray-400 font-mono">{u.username}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <div className="space-y-0.5">
                              {u.email && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" /> {u.email}
                                </p>
                              )}
                              {u.phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" /> {u.phone}
                                </p>
                              )}
                              {u.role === "student" && u.parentId && (
                                <p className="text-xs text-gray-400">
                                  Parent: {u.parentId.firstName} {u.parentId.lastName}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {u.age && <p>Age: {u.age}</p>}
                              {u.gender && <p className="capitalize">Gender: {u.gender}</p>}
                              <p>{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", meta.color)}>
                              <Icon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "inline-block w-2 h-2 rounded-full",
                                  u.isActive ? "bg-emerald-500" : "bg-gray-300"
                                )}
                              />
                              <span className={cn("text-xs font-medium", u.isActive ? "text-emerald-700" : "text-gray-400")}>
                                {u.isActive ? "Active" : "Inactive"}
                              </span>
                              {u.mustChangePassword && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium ml-1">
                                  pwd change
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => router.push(`${basePath}/users/${u._id}`)}>
                                  View profile
                                </DropdownMenuItem>
                                {u.role === "student" && (
                                  <DropdownMenuItem onClick={() => router.push(`${basePath}/users/${u._id}/credentials`)}>
                                    Set credentials
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleAction(u._id, "reset-password", "reset password")}
                                  disabled={actionLoading === u._id + "reset-password"}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                  Reset password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAction(u._id, "toggle-active", "toggle status")}
                                  disabled={actionLoading === u._id + "toggle-active"}
                                >
                                  <Power className="w-3.5 h-3.5 mr-2" />
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setDeleteTarget(u)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Remove user
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Showing {users.length} of {total} users</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                          p === page ? "bg-secondary text-white" : "text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.firstName} {deleteTarget?.lastName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete their account.
              {deleteTarget?.role === "parent" && " All student accounts linked to this parent will also be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(AdminUsersPage, ["admin", "super_admin"])
