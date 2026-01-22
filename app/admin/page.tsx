"use client"

import { useState, useEffect, useCallback } from "react"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut,
} from "lucide-react"
import Link from "next/link"

interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  studentAge: string
  subjects: string[]
  gradeLevel: string
  country: string
  preferredDays: string[]
  preferredTime: string
  curriculum: string
  status: "new" | "contacted" | "converted" | "closed"
  notes: string
  source: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  byStatus: {
    new: number
    contacted: number
    converted: number
    closed: number
  }
  todayLeads: number
  weekLeads: number
  byCountry: { _id: string; count: number }[]
  bySubject: { _id: string; count: number }[]
  conversionRate: string | number
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  converted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

const statusIcons = {
  new: Clock,
  contacted: Phone,
  converted: CheckCircle,
  closed: XCircle,
}

export default withAuth(function AdminPage() {
  const { admin, logout } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()

      if (data.success) {
        setLeads(data.data.leads)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    }
  }, [currentPage, statusFilter])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/leads/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchLeads(), fetchStats()])
      setLoading(false)
    }
    loadData()
  }, [fetchLeads])

  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchLeads(), fetchStats()])
    setLoading(false)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        await Promise.all([fetchLeads(), fetchStats()])
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(data.data)
        }
      }
    } catch (error) {
      console.error("Error updating lead:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()

      if (data.success && selectedLead) {
        setSelectedLead(data.data)
      }
    } catch (error) {
      console.error("Error updating notes:", error)
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setIsViewModalOpen(false)
        await Promise.all([fetchLeads(), fetchStats()])
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
    }
  }

  const openWhatsApp = (lead: Lead) => {
    const message = `Hi ${lead.name}, this is D-lighter Tutor following up on your inquiry for ${lead.subjects.join(", ")} tutoring for your child.`
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const filteredLeads = leads.filter((lead) =>
    searchQuery
      ? lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery)
      : true
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              D-lighter Admin
            </Link>
            <span className="text-primary-foreground/60 text-sm">Lead Management</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="font-semibold text-primary-foreground">
                  {admin?.firstName?.[0]}{admin?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-medium">{admin?.firstName} {admin?.lastName}</p>
                <p className="text-primary-foreground/60 text-xs capitalize">{admin?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/sales" target="_blank">
              <Button variant="secondary" size="sm">
                View Sales Page
              </Button>
            </Link>
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.new}</p>
                  <p className="text-xs text-muted-foreground">New</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.contacted}</p>
                  <p className="text-xs text-muted-foreground">Contacted</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.converted}</p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayLeads}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const StatusIcon = statusIcons[lead.status]
                  return (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.studentAge}</div>
                          <div className="text-muted-foreground">{lead.gradeLevel}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[150px] truncate" title={lead.subjects.join(", ")}>
                          {lead.subjects.slice(0, 2).join(", ")}
                          {lead.subjects.length > 2 && ` +${lead.subjects.length - 2}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          {lead.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => openWhatsApp(lead)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>View and manage lead information</DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </span>
                </div>
                <Select
                  value={selectedLead.status}
                  onValueChange={(v) => updateLeadStatus(selectedLead._id, v)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parent Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  Parent Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedLead.email}`} className="font-medium text-secondary hover:underline cursor-pointer">
                      {selectedLead.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedLead.phone}`} className="font-medium text-secondary hover:underline cursor-pointer">
                      {selectedLead.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{selectedLead.country}</p>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  Student Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{selectedLead.studentAge}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grade Level</p>
                    <p className="font-medium">{selectedLead.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Curriculum</p>
                    <p className="font-medium">{selectedLead.curriculum}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLead.subjects.map((s) => (
                        <span key={s} className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Schedule Preferences
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Preferred Days</p>
                    <p className="font-medium">{selectedLead.preferredDays.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preferred Time</p>
                    <p className="font-medium">{selectedLead.preferredTime}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this lead..."
                  defaultValue={selectedLead.notes}
                  onBlur={(e) => updateLeadNotes(selectedLead._id, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Meta */}
              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>Created: {formatDate(selectedLead.createdAt)}</p>
                <p>Source: {selectedLead.source}</p>
                <p>ID: {selectedLead._id}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => openWhatsApp(selectedLead)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedLead.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteLead(selectedLead._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})
