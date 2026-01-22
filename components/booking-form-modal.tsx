"use client"

import { useState, createContext, useContext, ReactNode, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Gift,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"

// Context for managing modal state
interface BookingFormContextType {
  isOpen: boolean
  selectedPlan: string
  openModal: (plan?: string) => void
  closeModal: () => void
}

const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined)

export function useBookingForm() {
  const context = useContext(BookingFormContext)
  if (!context) {
    throw new Error("useBookingForm must be used within a BookingFormProvider")
  }
  return context
}

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const openModal = (plan?: string) => {
    setSelectedPlan(plan || "")
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

function BookingFormModal() {
  const { isOpen, selectedPlan, closeModal } = useBookingForm()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    otherCountry: "",
    studentAge: "",
    gradeLevel: "",
    curriculum: "",
    subjects: [] as string[],
    preferredDays: [] as string[],
    preferredTime: "",
    plan: "",
    learningGoal: "",
  })

  // Update plan when selectedPlan changes
  useEffect(() => {
    if (selectedPlan) {
      setFormData(prev => ({ ...prev, plan: selectedPlan }))
    }
  }, [selectedPlan])

  const plans = [
    "Starter Plan",
    "Premium Plan", 
    "Ultimate Plan",
  ]

  const subjects = [
    "Mathematics",
    "English Language",
    "Sciences (Physics, Chemistry, Biology)",
    "Yoruba Language",
    "Igbo Language",
    "Hausa Language",
    "French",
    "Tech Skills (Coding, AI, Graphics, Animation, ICT)",
    "Music (Piano, Guitar, Drums)",
    "Other African Languages",
  ]

  const countries = [
    { value: "United Kingdom", label: "🇬🇧 United Kingdom" },
    { value: "United States", label: "🇺🇸 United States" },
    { value: "Canada", label: "🇨🇦 Canada" },
    { value: "Ireland", label: "🇮🇪 Ireland" },
    { value: "Germany", label: "🇩🇪 Germany" },
    { value: "France", label: "🇫🇷 France" },
    { value: "Netherlands", label: "🇳🇱 Netherlands" },
    { value: "Belgium", label: "🇧🇪 Belgium" },
    { value: "Italy", label: "🇮🇹 Italy" },
    { value: "Spain", label: "🇪🇸 Spain" },
    { value: "Sweden", label: "🇸🇪 Sweden" },
    { value: "Norway", label: "🇳🇴 Norway" },
    { value: "Denmark", label: "🇩🇰 Denmark" },
    { value: "Switzerland", label: "🇨🇭 Switzerland" },
    { value: "Austria", label: "🇦🇹 Austria" },
    { value: "Portugal", label: "🇵🇹 Portugal" },
    { value: "Australia", label: "🇦🇺 Australia" },
    { value: "New Zealand", label: "🇳🇿 New Zealand" },
    { value: "United Arab Emirates", label: "🇦🇪 United Arab Emirates" },
    { value: "Saudi Arabia", label: "🇸🇦 Saudi Arabia" },
    { value: "Qatar", label: "🇶🇦 Qatar" },
    { value: "Kuwait", label: "🇰🇼 Kuwait" },
    { value: "Bahrain", label: "🇧🇭 Bahrain" },
    { value: "Oman", label: "🇴🇲 Oman" },
    { value: "South Africa", label: "🇿🇦 South Africa" },
    { value: "Nigeria", label: "🇳🇬 Nigeria" },
    { value: "Ghana", label: "🇬🇭 Ghana" },
    { value: "Kenya", label: "🇰🇪 Kenya" },
    { value: "Other", label: "🌐 Other (Please specify)" },
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, plan: selectedPlan || formData.plan }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Request Submitted! 🎉", {
          description: "We'll contact you within 24 hours to schedule your FREE trial class.",
        })
        closeModal()
        setStep(1)
        setFormData({
          name: "",
          email: "",
          phone: "",
          country: "",
          otherCountry: "",
          studentAge: "",
          gradeLevel: "",
          curriculum: "",
          subjects: [],
          preferredDays: [],
          preferredTime: "",
          plan: "",
          learningGoal: "",
        })
      } else {
        toast.error("Submission Failed", {
          description: data.error || "Please try again or contact us on WhatsApp.",
        })
      }
    } catch {
      toast.error("Submission Failed", {
        description: "Please try again or contact us on WhatsApp.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 =
    formData.name && formData.email && formData.phone && formData.country && 
    (formData.country !== "Other" || formData.otherCountry) && 
    formData.studentAge && formData.gradeLevel && formData.curriculum
  const canProceedStep2 = formData.subjects.length > 0
  const canProceedStep3 = formData.preferredDays.length > 0 && formData.preferredTime

  const handleClose = () => {
    closeModal()
    setStep(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-secondary" />
            Book Your FREE Trial Class
          </DialogTitle>
          {selectedPlan && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected Plan: <span className="font-semibold text-secondary">{selectedPlan}</span>
            </p>
          )}
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s
                    ? "bg-secondary text-secondary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-16 sm:w-24 mx-2 rounded-full transition-all ${
                    step > s ? "bg-secondary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Contact Information */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <User className="h-5 w-5 text-secondary" />
                Parent & Student Details
              </h3>
              <p className="text-sm text-muted-foreground">Tell us about yourself and your child</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Parent&apos;s Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Adeyemi"
                  className="h-12 border-2 bg-background focus:border-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-12 border-2 bg-background focus:border-secondary"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  WhatsApp Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 7123 456789"
                  className="h-12 border-2 bg-background focus:border-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Country of Residence
                </Label>
                <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v, otherCountry: v !== "Other" ? "" : formData.otherCountry })}>
                  <SelectTrigger className="h-12 border-2 bg-background">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.country === "Other" && (
                  <Input
                    id="otherCountry"
                    value={formData.otherCountry}
                    onChange={(e) => setFormData({ ...formData, otherCountry: e.target.value })}
                    placeholder="Please specify your country"
                    className="h-12 border-2 bg-background focus:border-secondary mt-2"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="studentAge" className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Child&apos;s Age
                </Label>
                <Select value={formData.studentAge} onValueChange={(v) => setFormData({ ...formData, studentAge: v })}>
                  <SelectTrigger className="h-12 border-2 bg-background">
                    <SelectValue placeholder="Age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 3).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Grade/Year
                </Label>
                <Select value={formData.gradeLevel} onValueChange={(v) => setFormData({ ...formData, gradeLevel: v })}>
                  <SelectTrigger className="h-12 border-2 bg-background">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reception">Reception</SelectItem>
                    <SelectItem value="Year 1">Year 1</SelectItem>
                    <SelectItem value="Year 2">Year 2</SelectItem>
                    <SelectItem value="Year 3">Year 3</SelectItem>
                    <SelectItem value="Year 4">Year 4</SelectItem>
                    <SelectItem value="Year 5">Year 5</SelectItem>
                    <SelectItem value="Year 6">Year 6</SelectItem>
                    <SelectItem value="Year 7">Year 7</SelectItem>
                    <SelectItem value="Year 8">Year 8</SelectItem>
                    <SelectItem value="Year 9">Year 9</SelectItem>
                    <SelectItem value="Year 10 (GCSE)">Year 10 (GCSE)</SelectItem>
                    <SelectItem value="Year 11 (GCSE)">Year 11 (GCSE)</SelectItem>
                    <SelectItem value="Year 12 (A-Level)">Year 12 (A-Level)</SelectItem>
                    <SelectItem value="Year 13 (A-Level)">Year 13 (A-Level)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="curriculum" className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Curriculum
                </Label>
                <Select value={formData.curriculum} onValueChange={(v) => setFormData({ ...formData, curriculum: v })}>
                  <SelectTrigger className="h-12 border-2 bg-background">
                    <SelectValue placeholder="Curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="British">British</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Nigerian">Nigerian</SelectItem>
                    <SelectItem value="IB">International Baccalaureate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
              >
                Continue to Subjects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Subjects */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                What would you like your child to learn?
              </h3>
              <p className="text-sm text-muted-foreground">Select all subjects that apply</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {subjects.map((subject) => (
                <label
                  key={subject}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all bg-muted/30 hover:bg-muted/50 ${
                    formData.subjects.includes(subject)
                      ? "border-secondary bg-secondary/10"
                      : "border-border"
                  }`}
                >
                  <Checkbox
                    checked={formData.subjects.includes(subject)}
                    onCheckedChange={() => handleSubjectToggle(subject)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium">{subject}</span>
                </label>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-full"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
              >
                Continue to Schedule
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                Schedule & Goals
              </h3>
              <p className="text-sm text-muted-foreground">Select preferred days, time, and your learning goal</p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="plan" className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-muted-foreground" />
                Preferred Plan
              </Label>
              <Select
                value={formData.plan}
                onValueChange={(v) => setFormData({ ...formData, plan: v })}
              >
                <SelectTrigger className="h-12 border-2 bg-background">
                  <SelectValue placeholder="Select a plan (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <p className="text-xs text-secondary">Pre-selected from your choice</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Preferred Days</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      formData.preferredDays.includes(day)
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
                        : "bg-background text-foreground border-border hover:border-secondary/50 hover:bg-muted/50"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Preferred Time (Your Local Time)
              </Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(v) => setFormData({ ...formData, preferredTime: v })}
              >
                <SelectTrigger className="h-12 border-2 bg-background">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (8am - 12pm)">Morning (8am - 12pm)</SelectItem>
                  <SelectItem value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</SelectItem>
                  <SelectItem value="Evening (4pm - 8pm)">Evening (4pm - 8pm)</SelectItem>
                  <SelectItem value="Flexible">Flexible - Any time works</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Learning Goal */}
            <div className="space-y-2">
              <Label htmlFor="learningGoal" className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-muted-foreground" />
                Learning Goal (Optional)
              </Label>
              <Textarea
                id="learningGoal"
                value={formData.learningGoal}
                onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                placeholder="e.g., Improve grades in Mathematics, Prepare for GCSE exams, Build confidence in English..."
                className="min-h-[80px] border-2 bg-background focus:border-secondary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tell us what you hope your child will achieve
              </p>
            </div>

            <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Gift className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Your First Class is FREE!</p>
                  <p className="text-sm text-muted-foreground">
                    No payment required. Try us risk-free and see your child shine!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-full"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canProceedStep3 || isSubmitting}
                className="flex-1 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Book FREE Trial
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
