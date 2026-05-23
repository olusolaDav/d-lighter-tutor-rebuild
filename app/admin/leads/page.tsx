"use client"

import { useState, useEffect, useCallback } from "react"
import { withAuth, useAuth } from "@/lib/auth/AuthContext"
import { toast } from "sonner"
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
  Download,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface Lead {
  _id: string
  // New fields
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  parentCountry?: string
  learnerName?: string
  learnerEmail?: string
  learnerAge?: string
  learnerGrade?: string
  learnerSchool?: string
  learnerCountry?: string
  subjects: string[]
  examType?: string
  examDate?: string
  gcseSubjects?: string[]
  weakAreas?: string
  learningGoals?: string
  testerDate?: string
  testerTime?: string
  testerAmPm?: string
  preferredDays: string[]
  preferredClassTime?: string
  hoursPerWeek?: string
  urgentNeeds?: string
  specificResources?: string
  additionalInfo?: string
  referralSource?: string
  // Legacy fields
  name?: string
  email?: string
  phone?: string
  studentAge?: string
  gradeLevel?: string
  country?: string
  preferredTime?: string
  curriculum?: string
  status: "new" | "contacted" | "converted" | "closed"
  notes: string
  source: string
  plan?: string
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
  converted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

const statusIcons = {
  new: Clock,
  contacted: Phone,
  converted: CheckCircle,
  closed: XCircle,
}

function LeadsPage() {
  const { user } = useAuth()
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

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteLead = async (leadId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, { method: "DELETE" })
      const data = await response.json()
      if (data.success) {
        setIsViewModalOpen(false)
        setDeleteConfirmId(null)
        await Promise.all([fetchLeads(), fetchStats()])
        toast.success("Enquiry deleted successfully")
      } else {
        toast.error("Failed to delete enquiry")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setIsDeleting(false)
    }
  }

  const exportCSV = () => {
    if (!leads.length) return
    const headers = [
      "Parent Name","Parent Email","Parent Phone","Parent Country",
      "Learner Name","Learner Age","Learner Grade","Learner School","Learner Country",
      "Subjects","Exam Type","Exam Date","GCSE Subjects",
      "Weak Areas","Learning Goals",
      "Tester Date","Tester Time","Preferred Days","Class Time","Hours/Week",
      "Urgent Needs","Specific Resources","Additional Info",
      "Referral Source","Plan","Status","Source","Date Submitted",
    ]
    const rows = leads.map(l => [
      l.parentName ?? l.name ?? "",
      l.parentEmail ?? l.email ?? "",
      l.parentPhone ?? l.phone ?? "",
      l.parentCountry ?? l.country ?? "",
      l.learnerName ?? "",
      l.learnerAge ?? l.studentAge ?? "",
      l.learnerGrade ?? l.gradeLevel ?? "",
      l.learnerSchool ?? "",
      l.learnerCountry ?? "",
      (l.subjects ?? []).join("; "),
      l.examType ?? "",
      l.examDate ?? "",
      (l.gcseSubjects ?? []).join("; "),
      l.weakAreas ?? "",
      l.learningGoals ?? "",
      l.testerDate ?? "",
      l.testerTime ? `${l.testerTime} ${l.testerAmPm ?? ""}` : "",
      (l.preferredDays ?? []).join("; "),
      l.preferredClassTime ?? l.preferredTime ?? "",
      l.hoursPerWeek ?? "",
      l.urgentNeeds ?? "",
      l.specificResources ?? "",
      l.additionalInfo ?? "",
      l.referralSource ?? "",
      l.plan ?? "",
      l.status,
      l.source,
      formatDate(l.createdAt),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported successfully")
  }

  const openWhatsApp = (lead: Lead) => {
    const name = lead.parentName ?? lead.name ?? ""
    const phone = (lead.parentPhone ?? lead.phone ?? "").replace(/\D/g, "")
    const message = `Hi ${name}, this is D-lighter Tutor following up on your enquiry for ${lead.subjects.join(", ")} tutoring for your child.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
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
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Enrolment Enquiries"
        subtitle="Track and manage all incoming enrolment enquiries"
        actions={
          <div className="flex gap-2">
            <Button onClick={exportCSV} variant="outline" size="sm" disabled={!leads.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
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
                  <p className="text-xs text-muted-foreground">Total Enquiries</p>
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
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.contacted}</p>
                  <p className="text-xs text-muted-foreground">Contacted</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus.converted}</p>
                  <p className="text-xs text-muted-foreground">Converted</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
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
                  const displayName = lead.parentName ?? lead.name ?? "—"
                  const displayEmail = lead.parentEmail ?? lead.email ?? "—"
                  const displayPhone = lead.parentPhone ?? lead.phone ?? "—"
                  const displayCountry = lead.parentCountry ?? lead.country ?? "—"
                  const displayLearner = lead.learnerName ? `${lead.learnerName}, Age ${lead.learnerAge ?? lead.studentAge ?? ""}` : `Age ${lead.studentAge ?? ""}`
                  return (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {displayEmail}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {displayPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{lead.learnerName ?? "—"}</div>
                          <div className="text-muted-foreground text-xs">{lead.learnerGrade ?? lead.gradeLevel ?? ""}{lead.learnerAge || lead.studentAge ? `, Age ${lead.learnerAge ?? lead.studentAge}` : ""}</div>
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
                          {displayCountry}
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
                        <div className="flex justify-end gap-1">
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
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700"
                            onClick={() => openWhatsApp(lead)}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteConfirmId(lead._id)}>
                            <Trash2 className="h-4 w-4" />
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

      {/* Enquiry Detail Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>View and manage enrolment enquiry</DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-5">
              {/* Status row */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </span>
                </div>
                <Select value={selectedLead.status} onValueChange={v => updateLeadStatus(selectedLead._id, v)} disabled={isUpdating}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parent */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-secondary" />Parent/Guardian</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{selectedLead.parentName ?? selectedLead.name ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Email</p>
                    <a href={`mailto:${selectedLead.parentEmail ?? selectedLead.email}`} className="font-medium text-secondary hover:underline text-sm">{selectedLead.parentEmail ?? selectedLead.email ?? "—"}</a></div>
                  <div><p className="text-muted-foreground text-xs">Phone</p>
                    <a href={`tel:${selectedLead.parentPhone ?? selectedLead.phone}`} className="font-medium text-secondary hover:underline text-sm">{selectedLead.parentPhone ?? selectedLead.phone ?? "—"}</a></div>
                  <div><p className="text-muted-foreground text-xs">Country</p><p className="font-medium">{selectedLead.parentCountry ?? selectedLead.country ?? "—"}</p></div>
                </div>
              </div>

              {/* Learner */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-secondary" />Learner</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{selectedLead.learnerName ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{selectedLead.learnerEmail ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Age</p><p className="font-medium">{selectedLead.learnerAge ?? selectedLead.studentAge ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Grade</p><p className="font-medium">{selectedLead.learnerGrade ?? selectedLead.gradeLevel ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">School</p><p className="font-medium">{selectedLead.learnerSchool ?? "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">School Country</p><p className="font-medium">{selectedLead.learnerCountry ?? "—"}</p></div>
                </div>
              </div>

              {/* Subjects & Exams */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-secondary" />Subjects & Exams</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLead.subjects.map(s => (
                        <span key={s} className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div><p className="text-muted-foreground text-xs">Exam Preparation</p><p className="font-medium">{selectedLead.examType ?? "—"}</p></div>
                  {selectedLead.examDate && <div><p className="text-muted-foreground text-xs">Exam Date</p><p className="font-medium">{selectedLead.examDate}</p></div>}
                  {selectedLead.gcseSubjects?.length ? (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground text-xs mb-1">GCSE Options</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedLead.gcseSubjects.map(s => (
                          <span key={s} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Learning Needs */}
              {(selectedLead.weakAreas || selectedLead.learningGoals) && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-secondary" />Learning Needs</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {selectedLead.weakAreas && <div><p className="text-muted-foreground text-xs">Weak Areas</p><p className="font-medium text-xs leading-relaxed">{selectedLead.weakAreas}</p></div>}
                    {selectedLead.learningGoals && <div><p className="text-muted-foreground text-xs">Learning Goals</p><p className="font-medium text-xs leading-relaxed">{selectedLead.learningGoals}</p></div>}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-secondary" />Schedule</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {selectedLead.testerDate && <div><p className="text-muted-foreground text-xs">Tester Session</p><p className="font-medium">{selectedLead.testerDate} {selectedLead.testerTime} {selectedLead.testerAmPm}</p></div>}
                  <div><p className="text-muted-foreground text-xs">Preferred Days</p><p className="font-medium">{selectedLead.preferredDays.join(", ")}</p></div>
                  {selectedLead.preferredClassTime && <div><p className="text-muted-foreground text-xs">Class Time</p><p className="font-medium">{selectedLead.preferredClassTime}</p></div>}
                  {selectedLead.hoursPerWeek && <div><p className="text-muted-foreground text-xs">Hours/Week</p><p className="font-medium">{selectedLead.hoursPerWeek}</p></div>}
                </div>
              </div>

              {/* Additional */}
              {(selectedLead.urgentNeeds || selectedLead.referralSource) && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-secondary" />Additional</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {selectedLead.urgentNeeds && <div><p className="text-muted-foreground text-xs">Urgent Needs</p><p className="text-xs leading-relaxed">{selectedLead.urgentNeeds}</p></div>}
                    {selectedLead.referralSource && <div><p className="text-muted-foreground text-xs">Heard About Us</p><p className="font-medium">{selectedLead.referralSource}</p></div>}
                    {selectedLead.plan && <div><p className="text-muted-foreground text-xs">Plan</p><p className="font-medium">{selectedLead.plan}</p></div>}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-semibold">Admin Notes</Label>
                <Textarea id="notes" placeholder="Add notes..." defaultValue={selectedLead.notes}
                  onBlur={e => updateLeadNotes(selectedLead._id, e.target.value)} className="mt-1" rows={3} />
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t space-y-0.5">
                <p>Submitted: {formatDate(selectedLead.createdAt)} · Source: {selectedLead.source} · ID: {selectedLead._id}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => openWhatsApp(selectedLead)}>
                  <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
                </Button>
                <Button variant="outline" onClick={() => window.location.href = `mailto:${selectedLead.parentEmail ?? selectedLead.email}`}>
                  <Mail className="h-4 w-4 mr-2" />Email
                </Button>
                <Button variant="destructive" size="icon" onClick={() => setDeleteConfirmId(selectedLead._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />Delete Enquiry
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this enquiry. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirmId && deleteLead(deleteConfirmId)} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(LeadsPage, ["admin", "super_admin"])
