"use client"

import { useState, createContext, useContext, ReactNode, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  User,
  Users,
  BookOpen,
  Calendar,
  Info,
  MessageCircle,
} from "lucide-react"
import {
  FORM_SUBJECTS,
  EXAM_TYPES,
  GCSE_OPTIONS,
  REFERRAL_SOURCES,
  COUNTRIES,
  DAYS_OF_WEEK,
  INITIAL_ENROLLMENT_FORM_DATA,
  type EnrollmentFormData,
} from "@/lib/constants/form-data"
import { cn } from "@/lib/utils"

// ── Context ──────────────────────────────────────────────────────────────────
interface BookingFormContextType {
  isOpen: boolean
  selectedPlan: string
  openModal: (plan?: unknown) => void
  closeModal: () => void
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined)

export function useBookingForm() {
  const context = useContext(BookingFormContext)
  if (!context) throw new Error("useBookingForm must be used within a BookingFormProvider")
  return context
}

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const openModal = (plan?: unknown) => {
    // Some callers pass onClick handlers directly, which sends a React event object.
    // Accept only string plans and ignore everything else.
    const normalizedPlan = typeof plan === "string" ? plan : ""
    setSelectedPlan(normalizedPlan)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setSelectedPlan("")
  }

  return (
    <BookingFormContext.Provider value={{ isOpen, selectedPlan, openModal, closeModal }}>
      {children}
      <BookingFormModal />
    </BookingFormContext.Provider>
  )
}

// ── Step progress ─────────────────────────────────────────────────────────────
const STEP_LABELS = ["Parent & Learner", "Subjects & Exams", "Tester Schedule", "Needs & Class Plan", "Final Details"]
const TOTAL_STEPS = STEP_LABELS.length

function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-3">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={n} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                done && "bg-secondary border-secondary text-white",
                active && "bg-secondary border-secondary text-white ring-4 ring-secondary/20",
                !done && !active && "bg-gray-100 border-gray-200 text-gray-400",
              )}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={cn("text-[10px] text-center leading-tight hidden sm:block font-medium",
                active ? "text-secondary" : done ? "text-gray-500" : "text-gray-400"
              )}>{label}</span>
            </div>
          )
        })}
      </div>
      <div className="relative h-1.5 bg-gray-100 rounded-full">
        <div className="absolute inset-y-0 left-0 bg-secondary rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">Step {step} of {TOTAL_STEPS}</p>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, error, children, className }: {
  label: string; required?: boolean; error?: string; children: ReactNode; className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><Info className="w-3 h-3 flex-shrink-0" />{error}</p>}
    </div>
  )
}

const inputCls = (err?: boolean) => cn(
  "h-11 border rounded-lg transition-colors focus-visible:ring-secondary/30",
  err ? "border-red-400 bg-red-50/30 focus-visible:ring-red-200" : "border-gray-200 focus:border-secondary/60"
)
const textareaCls = (err?: boolean) => cn(
  "border rounded-lg transition-colors resize-none focus-visible:ring-secondary/30",
  err ? "border-red-400 bg-red-50/30 focus-visible:ring-red-200" : "border-gray-200 focus:border-secondary/60"
)

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 mb-1">
      <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-secondary" />
      </div>
      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
function BookingFormModal() {
  const { isOpen, selectedPlan, closeModal } = useBookingForm()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successWhatsAppUrl, setSuccessWhatsAppUrl] = useState("")
  const [form, setForm] = useState<EnrollmentFormData>(INITIAL_ENROLLMENT_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [scheduleData, setScheduleData] = useState<{
    timezone: string
    availableDates: Set<string>
    unavailableDates: Set<string>
    slots: Array<{ key: string; label: string; available: boolean }>
  }>({
    timezone: "West Africa Time (WAT)",
    availableDates: new Set<string>(),
    unavailableDates: new Set<string>(),
    slots: [],
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const monthLabel = calendarMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const monthValue = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`

  const toDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDateObj = form.testerDate ? new Date(`${form.testerDate}T00:00:00`) : null
  const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const leadingEmptyDays = Array.from({ length: firstWeekday })
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1)
    const dateKey = toDateKey(date)
    const inPast = date < today
    const isSelected = selectedDateObj ? isSameDay(date, selectedDateObj) : false
    const isAvailable = scheduleData.availableDates.has(dateKey)
    const isUnavailable = inPast || scheduleData.unavailableDates.has(dateKey) || !isAvailable

    return { date, dateKey, day: i + 1, isSelected, isAvailable, isUnavailable }
  })

  const fetchSchedule = async (dateKey?: string) => {
    setScheduleLoading(true)
    try {
      const params = new URLSearchParams({ month: monthValue })
      if (dateKey) params.set("date", dateKey)

      const res = await fetch(`/api/leads/tester-schedule?${params.toString()}`)
      const data = await res.json()

      if (!data.success) throw new Error(data.error || "Failed to load schedule")

      const payload = data.data
      const nextSlots = payload.slots || []

      setScheduleData({
        timezone: payload.timezone || "West Africa Time (WAT)",
        availableDates: new Set<string>(payload.availableDates || []),
        unavailableDates: new Set<string>(payload.unavailableDates || []),
        slots: nextSlots,
      })

      const selectedStillAvailable = nextSlots.some((slot: any) => slot.key === form.testerSlotKey && slot.available)
      const hasAnyAvailableSlot = nextSlots.some((slot: any) => slot.available)

      if (dateKey && form.testerSlotKey && (!selectedStillAvailable || !hasAnyAvailableSlot)) {
        set("testerSlotKey", "")
        set("testerTime", "")
        set("testerAmPm", "")
      }
      if (!form.testerTimezone && payload.timezone) {
        set("testerTimezone", payload.timezone)
      }
    } catch {
      toast.error("Could not load tester schedule right now")
    } finally {
      setScheduleLoading(false)
    }
  }

  const openWhatsAppSafely = (rawUrl?: string) => {
    const fallbackNumber = "2348129517392"
    const fallbackUrl = `https://wa.me/${fallbackNumber}`

    let targetUrl = fallbackUrl
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl)
        const host = parsed.hostname.toLowerCase()
        if (host === "wa.me" || host.endsWith(".whatsapp.com")) {
          targetUrl = parsed.toString()
        }
      } catch {
        // Ignore invalid URL and continue with fallback URL.
      }
    }

    const popup = window.open(targetUrl, "_blank", "noopener,noreferrer")
    if (!popup) {
      window.location.href = targetUrl
    }
  }

  useEffect(() => {
    if (selectedPlan) setForm(prev => ({ ...prev, plan: selectedPlan }))
  }, [selectedPlan])

  useEffect(() => {
    if (step === 3) {
      fetchSchedule(form.testerDate || undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, monthValue, form.testerDate])

  const set = (k: keyof EnrollmentFormData, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const toggleArr = (k: "subjects" | "preferredDays" | "gcseSubjects", v: string) =>
    setForm(prev => {
      const arr = prev[k] as string[]
      return { ...prev, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }
    })

  // Validation
  function validate(s: number) {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!form.parentName.trim()) e.parentName = "Required"
      if (!form.parentEmail.trim()) e.parentEmail = "Required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail)) e.parentEmail = "Invalid email"
      if (!form.parentPhone.trim()) e.parentPhone = "Required"
      if (!form.parentCountry) e.parentCountry = "Required"
      if (form.parentCountry === "Other" && !form.parentOtherCountry.trim()) e.parentOtherCountry = "Please specify"
      if (!form.learnerName.trim()) e.learnerName = "Required"
      if (!form.learnerEmail.trim()) e.learnerEmail = "Required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.learnerEmail)) e.learnerEmail = "Invalid email"
      if (!form.learnerAge.trim()) e.learnerAge = "Required"
      if (!form.learnerGrade.trim()) e.learnerGrade = "Required"
      if (!form.learnerSchool.trim()) e.learnerSchool = "Required"
      if (!form.learnerCountry.trim()) e.learnerCountry = "Required"
    }
    if (s === 2) {
      if (!form.subjects.length && !form.otherSubject.trim()) e.subjects = "Select at least one subject"
      if (!form.examType) e.examType = "Required"
    }
    if (s === 3) {
      if (!form.testerDate) e.testerDate = "Required"
      if (!form.testerTime.trim()) e.testerTime = "Required"
      if (!form.testerSlotKey.trim()) e.testerTime = "Please select an available time slot"
    }
    if (s === 4) {
      if (!form.weakAreas.trim()) e.weakAreas = "Required"
      if (!form.learningGoals.trim()) e.learningGoals = "Required"
      if (!form.preferredDays.length) e.preferredDays = "Select at least one day"
      if (!form.preferredClassTime.trim()) e.preferredClassTime = "Required"
      if (!form.hoursPerWeek.trim()) e.hoursPerWeek = "Required"
    }
    if (s === 5) {
      if (!form.urgentNeeds.trim()) e.urgentNeeds = "Required"
      if (!form.specificResources.trim()) e.specificResources = "Required"
      if (!form.additionalInfo.trim()) e.additionalInfo = "Required"
      if (!form.referralSource) e.referralSource = "Required"
      if (form.referralSource === "Other" && !form.otherReferralSource.trim()) e.otherReferralSource = "Please specify"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate(step)) setStep(s => s + 1)
    else toast.error("Please fill in all required fields before continuing")
  }
  function back() { setStep(s => s - 1); setErrors({}) }

  async function handleSubmit() {
    if (!validate(5)) { toast.error("Please fill in all required fields"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan || form.plan }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessWhatsAppUrl(data.data?.whatsappUrl ?? "")
        setShowSuccess(true)
        openWhatsAppSafely(data.data?.whatsappUrl)
      } else {
        if (res.status === 409) {
          setStep(3)
          await fetchSchedule(form.testerDate || undefined)
        }
        toast.error("Submission failed", { description: data.error || "Please try again." })
      }
    } catch {
      toast.error("Network error", { description: "Please check your connection and try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    closeModal()
    setStep(1)
    setForm(INITIAL_ENROLLMENT_FORM_DATA)
    setErrors({})
    setShowSuccess(false)
    const now = new Date()
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setScheduleData({
      timezone: "West Africa Time (WAT)",
      availableDates: new Set<string>(),
      unavailableDates: new Set<string>(),
      slots: [],
    })
  }

  // GCSE groups
  const gcseGroups: Record<string, string[]> = {}
  for (const opt of GCSE_OPTIONS) {
    const g = opt.startsWith("Maths") ? "Maths"
      : opt.startsWith("English") ? "English"
      : opt.includes("Triple") ? "Triple Science"
      : opt.includes("Combined") ? "Combined Science"
      : "Computer Science"
    if (!gcseGroups[g]) gcseGroups[g] = []
    gcseGroups[g].push(opt)
  }

  // Success screen
  if (showSuccess) {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Enquiry Submitted! 🎉</DialogTitle>
            <DialogDescription className="sr-only">
              Confirmation dialog after submitting the learner enquiry form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
              <p className="text-green-800 text-sm font-semibold mb-1">✅ Your enquiry has been received</p>
              <ul className="text-xs text-green-700 space-y-0.5 list-disc list-inside">
                <li>Our team will review your details</li>
                <li>Continue on WhatsApp for instant support</li>
                <li>We will help you schedule your FREE tester session</li>
              </ul>
            </div>
            {successWhatsAppUrl && (
              <Button onClick={() => openWhatsAppSafely(successWhatsAppUrl)}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11">
                <MessageCircle className="w-4 h-4" />Continue on WhatsApp
              </Button>
            )}
            <Button variant="outline" onClick={handleClose} className="w-full h-11">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="mb-1">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Book a FREE Tester Session
          </DialogTitle>
          <DialogDescription className="sr-only">
            Multi-step form for parents to book a free tester session and submit learner details.
          </DialogDescription>
          {selectedPlan && (
            <p className="text-sm text-gray-500 mt-0.5">
              Plan: <span className="font-semibold text-secondary">{selectedPlan}</span>
            </p>
          )}
        </DialogHeader>

        <StepProgress step={step} />

        {/* ── Step 1: Parent & Learner ─────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <SectionHeader icon={User} title="Section 1: Parent/Guardian Information" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Parent/Guardian Full Name" required error={errors.parentName}>
                <Input value={form.parentName} onChange={e => set("parentName", e.target.value)}
                  placeholder="Your full name" className={inputCls(!!errors.parentName)} />
              </Field>
              <Field label="Email Address" required error={errors.parentEmail}>
                <Input type="email" value={form.parentEmail} onChange={e => set("parentEmail", e.target.value)}
                  placeholder="you@example.com" className={inputCls(!!errors.parentEmail)} />
              </Field>
              <Field label="Phone Number / WhatsApp Number" required error={errors.parentPhone}>
                <Input value={form.parentPhone} onChange={e => set("parentPhone", e.target.value)}
                  placeholder="+44 7xxx xxxxxx" className={inputCls(!!errors.parentPhone)} />
              </Field>
              <Field label="Country of Residence" required error={errors.parentCountry}>
                <Select value={form.parentCountry} onValueChange={v => set("parentCountry", v)}>
                  <SelectTrigger className={cn("h-11 rounded-lg", errors.parentCountry ? "border-red-400" : "border-gray-200")}>
                    <SelectValue placeholder="Choose country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {form.parentCountry === "Other" && (
              <Field label="Please specify your country" required error={errors.parentOtherCountry}>
                <Input value={form.parentOtherCountry} onChange={e => set("parentOtherCountry", e.target.value)}
                  placeholder="Your country" className={inputCls(!!errors.parentOtherCountry)} />
              </Field>
            )}

            <SectionHeader icon={Users} title="Section 2: Learner's Information" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Learner's Full Name" required error={errors.learnerName}>
                <Input value={form.learnerName} onChange={e => set("learnerName", e.target.value)}
                  placeholder="Child's full name" className={inputCls(!!errors.learnerName)} />
              </Field>
              <Field label="Learner's Email Address" required error={errors.learnerEmail}>
                <Input type="email" value={form.learnerEmail} onChange={e => set("learnerEmail", e.target.value)}
                  placeholder="child@example.com" className={inputCls(!!errors.learnerEmail)} />
              </Field>
              <Field label="Learner's Age" required error={errors.learnerAge}>
                <Input type="number" min="3" max="25" value={form.learnerAge}
                  onChange={e => set("learnerAge", e.target.value)}
                  placeholder="e.g. 12" className={inputCls(!!errors.learnerAge)} />
              </Field>
              <Field label="Learner's Current Class / Grade" required error={errors.learnerGrade}>
                <Input value={form.learnerGrade} onChange={e => set("learnerGrade", e.target.value)}
                  placeholder="e.g. Year 9 / Grade 10" className={inputCls(!!errors.learnerGrade)} />
              </Field>
              <Field label="Name of Learner's School" required error={errors.learnerSchool}>
                <Input value={form.learnerSchool} onChange={e => set("learnerSchool", e.target.value)}
                  placeholder="School name" className={inputCls(!!errors.learnerSchool)} />
              </Field>
              <Field label="Country where learner attends school" required error={errors.learnerCountry}>
                <Input value={form.learnerCountry} onChange={e => set("learnerCountry", e.target.value)}
                  placeholder="e.g. United Kingdom" className={inputCls(!!errors.learnerCountry)} />
              </Field>
            </div>
            <div className="flex justify-end pt-1">
              <Button onClick={next} className="bg-secondary hover:bg-secondary/90 text-white px-8 h-11 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Subjects & Exams ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionHeader icon={BookOpen} title="Section 3: Subjects Enrolling For" />
            <Field label="Which subject(s) would the learner like tutoring in?" required error={errors.subjects}>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {FORM_SUBJECTS.map(s => (
                  <label key={s} className={cn(
                    "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors text-sm",
                    form.subjects.includes(s) ? "border-secondary bg-secondary/5 text-secondary font-medium" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                  )}>
                    <Checkbox checked={form.subjects.includes(s)} onCheckedChange={() => toggleArr("subjects", s)}
                      className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary flex-shrink-0" />
                    <span className="text-xs">{s}</span>
                  </label>
                ))}
                <label className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer col-span-2 text-sm",
                  form.otherSubject ? "border-secondary bg-secondary/5 text-secondary" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                )}>
                  <Checkbox checked={!!form.otherSubject} onCheckedChange={c => { if (!c) set("otherSubject", "") }}
                    className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary flex-shrink-0" />
                  <span className="flex-shrink-0 text-xs">Other:</span>
                  <Input value={form.otherSubject} onChange={e => set("otherSubject", e.target.value)}
                    placeholder="Please specify" onClick={e => e.stopPropagation()}
                    className="h-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 px-1 text-xs" />
                </label>
              </div>
            </Field>

            <SectionHeader icon={BookOpen} title="Section 4: Exams Preparation" />
            <Field label="Is the learner preparing for any exam?" required error={errors.examType}>
              <div className="space-y-1.5 mt-1">
                {EXAM_TYPES.map(t => (
                  <label key={t} className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
                    form.examType === t ? "border-secondary bg-secondary/5 text-secondary font-medium" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                  )}>
                    <input type="radio" name="examType" value={t} checked={form.examType === t}
                      onChange={() => { set("examType", t); if (t !== "GCSE") set("gcseSubjects", []) }}
                      className="accent-secondary" />
                    {t}
                  </label>
                ))}
                <label className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer text-sm",
                  form.examType === "Other" ? "border-secondary bg-secondary/5 text-secondary font-medium" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                )}>
                  <input type="radio" name="examType" value="Other" checked={form.examType === "Other"}
                    onChange={() => set("examType", "Other")} className="accent-secondary" />
                  <span className="flex-shrink-0">Other:</span>
                  <Input value={form.otherExamType} onChange={e => set("otherExamType", e.target.value)}
                    placeholder="Please specify" onClick={e => e.stopPropagation()}
                    className="h-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 px-1 text-sm" />
                </label>
              </div>
            </Field>

            {form.examType && form.examType !== "Not currently preparing for exams" && (
              <Field label="If yes, what exam and when is the exam date?" required error={errors.examDate}>
                <Input type="date" value={form.examDate} onChange={e => set("examDate", e.target.value)}
                  className={inputCls(!!errors.examDate)} />
              </Field>
            )}

            {form.examType === "GCSE" && (
              <Field label="If preparing for GCSE, choose subject(s), exam board and tier">
                <div className="space-y-4 mt-1 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(gcseGroups).map(([group, opts]) => (
                    <div key={group}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 sticky top-0 bg-white py-0.5">{group}</p>
                      <div className="space-y-1">
                        {opts.map(opt => (
                          <label key={opt} className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                            form.gcseSubjects.includes(opt) ? "border-secondary bg-secondary/5 text-secondary" : "border-gray-100 hover:border-secondary/30 hover:bg-gray-50"
                          )}>
                            <Checkbox checked={form.gcseSubjects.includes(opt)} onCheckedChange={() => toggleArr("gcseSubjects", opt)}
                              className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary flex-shrink-0" />
                            <span className="text-xs">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 hover:border-secondary/30 cursor-pointer">
                    <Checkbox checked={!!form.otherGcseSubject} onCheckedChange={c => { if (!c) set("otherGcseSubject", "") }}
                      className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary flex-shrink-0" />
                    <span className="text-xs flex-shrink-0">Other:</span>
                    <Input value={form.otherGcseSubject} onChange={e => set("otherGcseSubject", e.target.value)}
                      placeholder="Please specify" onClick={e => e.stopPropagation()}
                      className="h-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 px-1 text-xs" />
                  </label>
                </div>
              </Field>
            )}

            <div className="flex justify-between gap-3 pt-1">
              <Button variant="outline" onClick={back} className="px-6 h-11 gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </Button>
              <Button onClick={next} className="bg-secondary hover:bg-secondary/90 text-white px-8 h-11 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Tester Schedule ───────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <SectionHeader icon={Calendar} title="Section 5: Tester Session Scheduling" />
            <p className="text-xs text-gray-500 -mt-3">
              Tester sessions must be scheduled at least 24 hours in advance.
            </p>
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="grid lg:grid-cols-[1.5fr_1fr]">
                <div className="p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{monthLabel}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                      <div key={d} className="h-8 flex items-center justify-center font-medium">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {leadingEmptyDays.map((_, i) => (
                      <div key={`empty-${i}`} className="h-10" />
                    ))}
                    {monthDays.map((item) => (
                      <button
                        key={item.dateKey}
                        type="button"
                        disabled={item.isUnavailable}
                        onClick={() => {
                          set("testerDate", item.dateKey)
                          set("testerSlotKey", "")
                          set("testerTime", "")
                          set("testerAmPm", "")
                        }}
                        className={cn(
                          "h-10 rounded-lg text-sm transition-all border",
                          item.isSelected && "bg-secondary text-white border-secondary font-semibold",
                          !item.isSelected && item.isAvailable && "bg-white border-gray-200 text-gray-800 hover:border-secondary/60",
                          item.isUnavailable && "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                      >
                        {item.day}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" />Unavailable</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-gray-400" />Available</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-secondary" />Selected</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Select Time</h4>
                  <p className="text-sm text-gray-700 mb-1">{form.testerDate ? new Date(`${form.testerDate}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "Choose a date first"}</p>
                  <p className="text-xs text-gray-500 mb-3">{scheduleData.timezone}</p>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {scheduleLoading ? (
                      <p className="text-sm text-gray-500">Loading available times...</p>
                    ) : !form.testerDate ? (
                      <p className="text-sm text-gray-500">Select a date to view available time slots.</p>
                    ) : scheduleData.slots.length === 0 ? (
                      <p className="text-sm text-gray-500">No slots configured for this day.</p>
                    ) : (
                      scheduleData.slots.map((slot) => {
                        const selected = form.testerSlotKey === slot.key
                        return (
                          <button
                            key={slot.key}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => {
                              set("testerSlotKey", slot.key)
                              set("testerTime", slot.label)
                              set("testerAmPm", slot.label.includes("PM") ? "PM" : "AM")
                              set("testerTimezone", scheduleData.timezone)
                            }}
                            className={cn(
                              "w-full h-11 rounded-xl border px-3 text-sm flex items-center justify-between transition-all",
                              selected && "border-secondary bg-secondary/10 text-secondary font-semibold",
                              !selected && slot.available && "border-gray-200 hover:border-secondary/60",
                              !slot.available && "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                            )}
                          >
                            <span>{slot.label}</span>
                            <span className={cn("h-4 w-4 rounded-full border", selected ? "border-secondary bg-secondary" : "border-gray-300")} />
                          </button>
                        )
                      })
                    )}
                  </div>

                  {errors.testerDate || errors.testerTime ? (
                    <p className="text-xs text-red-500 mt-2">{errors.testerTime || errors.testerDate}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-1">
              <Button variant="outline" onClick={back} className="px-6 h-11 gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </Button>
              <Button onClick={next} className="bg-secondary hover:bg-secondary/90 text-white px-8 h-11 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Learning Needs & Class Plan ─────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <SectionHeader icon={BookOpen} title="Section 6: Learning Needs" />
            <Field label="What are the learner's weak areas or challenges?" required error={errors.weakAreas}>
              <p className="text-xs text-gray-400 -mt-1">e.g. Algebra, Essay writing, Reading comprehension, Exam confidence</p>
              <Textarea value={form.weakAreas} onChange={e => set("weakAreas", e.target.value)}
                placeholder="Describe the learner's weak areas..." rows={3} className={textareaCls(!!errors.weakAreas)} />
            </Field>
            <Field label="What learning goals do you want the tutor to focus on?" required error={errors.learningGoals}>
              <Textarea value={form.learningGoals} onChange={e => set("learningGoals", e.target.value)}
                placeholder="Describe desired learning outcomes..." rows={3} className={textareaCls(!!errors.learningGoals)} />
            </Field>

            <SectionHeader icon={Calendar} title="Section 7: Weekly Class Schedule" />
            <Field label="Preferred days for classes" required error={errors.preferredDays}>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS_OF_WEEK.map(day => (
                  <button key={day} type="button" onClick={() => toggleArr("preferredDays", day)}
                    className={cn("px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                      form.preferredDays.includes(day) ? "bg-secondary text-white border-secondary shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-secondary/50"
                    )}>
                    {day}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Preferred class time (state each day and time)" required error={errors.preferredClassTime}>
                <Textarea value={form.preferredClassTime} onChange={e => set("preferredClassTime", e.target.value)}
                  placeholder="e.g. Mon: 4–5 PM, Wed: 3–4 PM" rows={2} className={textareaCls(!!errors.preferredClassTime)} />
              </Field>
              <Field label="How many hours per week? (state subject and duration)" required error={errors.hoursPerWeek}>
                <Textarea value={form.hoursPerWeek} onChange={e => set("hoursPerWeek", e.target.value)}
                  placeholder="e.g. Maths: 2 hrs, English: 1 hr" rows={2} className={textareaCls(!!errors.hoursPerWeek)} />
              </Field>
            </div>

            <div className="flex justify-between gap-3 pt-1">
              <Button variant="outline" onClick={back} className="px-6 h-11 gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </Button>
              <Button onClick={next} className="bg-secondary hover:bg-secondary/90 text-white px-8 h-11 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Additional Info & Referral ───────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            <SectionHeader icon={Info} title="Section 8: Additional Information" />
            <Field label="Any urgent academic needs we should be aware of?" required error={errors.urgentNeeds}>
              <Textarea value={form.urgentNeeds} onChange={e => set("urgentNeeds", e.target.value)}
                placeholder="e.g. Exam in 3 weeks, needs intensive support..." rows={2} className={textareaCls(!!errors.urgentNeeds)} />
            </Field>
            <Field label="Do you have specific resources or curriculum you want the learner to use?" required error={errors.specificResources}>
              <Textarea value={form.specificResources} onChange={e => set("specificResources", e.target.value)}
                placeholder="e.g. CGP books, school textbooks, specific syllabus..." rows={2} className={textareaCls(!!errors.specificResources)} />
            </Field>
            <Field label="Any additional information you would like to share?" required error={errors.additionalInfo}>
              <Textarea value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)}
                placeholder="Anything else we should know..." rows={2} className={textareaCls(!!errors.additionalInfo)} />
            </Field>

            <SectionHeader icon={Info} title="Section 9: Referral Information" />
            <Field label="How did you hear about D-lighter Tutor?" required error={errors.referralSource}>
              <div className="space-y-1.5 mt-1">
                {REFERRAL_SOURCES.map(src => (
                  <label key={src} className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
                    form.referralSource === src ? "border-secondary bg-secondary/5 text-secondary font-medium" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                  )}>
                    <input type="radio" name="referral" value={src} checked={form.referralSource === src}
                      onChange={() => set("referralSource", src)} className="accent-secondary" />
                    {src}
                  </label>
                ))}
                <label className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer text-sm",
                  form.referralSource === "Other" ? "border-secondary bg-secondary/5 text-secondary font-medium" : "border-gray-200 hover:border-secondary/40 hover:bg-gray-50"
                )}>
                  <input type="radio" name="referral" value="Other" checked={form.referralSource === "Other"}
                    onChange={() => set("referralSource", "Other")} className="accent-secondary" />
                  <span className="flex-shrink-0">Other:</span>
                  <Input value={form.otherReferralSource} onChange={e => set("otherReferralSource", e.target.value)}
                    placeholder="Please specify" onClick={e => e.stopPropagation()}
                    className="h-6 border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 px-1 text-sm" />
                </label>
              </div>
            </Field>

            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 text-sm">Your first session is FREE!</p>
                <p className="text-xs text-gray-500 mt-0.5">No payment required. Try us risk-free and see your child thrive.</p>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-1">
              <Button variant="outline" onClick={back} className="px-6 h-11 gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}
                className="bg-secondary hover:bg-secondary/90 text-white px-8 h-11 gap-2">
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                  : <><CheckCircle2 className="w-4 h-4" />Submit Enquiry</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
