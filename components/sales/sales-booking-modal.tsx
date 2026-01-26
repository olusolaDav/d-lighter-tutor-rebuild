"use client"

import { useState } from "react"
import { toast } from "sonner"
import { generateWhatsAppUrl, redirectToWhatsApp } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  MessageCircle,
} from "lucide-react"
import {
  SUBJECTS,
  GRADE_LEVELS,
  COUNTRIES,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  CURRICULA,
  INITIAL_FORM_DATA,
  type BookingFormData,
} from "@/lib/constants/form-data"

interface SalesBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SalesBookingModal({ isOpen, onClose }: SalesBookingModalProps) {
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

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
    setError("")

    try {
      // First save to database
      const leadResponse = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const leadData = await leadResponse.json()

      if (!leadData.success) {
        throw new Error(leadData.error || "Failed to save lead")
      }

      // Then send email notification
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const emailData = await emailResponse.json()

      if (emailData.success) {
        // Generate WhatsApp URL with form data
        const whatsappUrl = generateWhatsAppUrl(formData, "sales-page")
        
        setIsSubmitted(true)
        toast.success("🎉 Request Submitted Successfully!", {
          description: "Click the WhatsApp button to continue the conversation...",
          duration: 8000,
        })
        
        // Try to open WhatsApp immediately
        const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer")
        
        if (!newWindow) {
          // Show a more prominent message
          setTimeout(() => {
            toast.info("Click the green WhatsApp button below! 👇", {
              description: "Your browser blocked the automatic redirect",
              duration: 5000
            })
          }, 1000)
        }
      } else {
        // Email failed but lead was saved - still show success but warn
        const whatsappUrl = generateWhatsAppUrl(formData, "sales-page")
        
        setIsSubmitted(true)
        toast.warning("Request Received!", {
          description: "Opening WhatsApp to continue setup...",
          duration: 6000,
        })
        
        // Open WhatsApp immediately
        window.open(whatsappUrl, "_blank", "noopener,noreferrer")
      }
    } catch {
      // On error, still attempt to redirect to WhatsApp with form data as backup
      const whatsappUrl = generateWhatsAppUrl(formData, "sales-page")
      
      toast.error("Submission Failed", {
        description: "Opening WhatsApp for manual submission...",
        duration: 5000,
      })
      
      setError(
        "Failed to submit. Opening WhatsApp for manual assistance."
      )
      
      // Open WhatsApp immediately as backup
      window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setFormStep(1)
      setIsSubmitted(false)
      setError("")
      setFormData(INITIAL_FORM_DATA)
      onClose()
    }
  }

  const nextStep = () => {
    if (formStep < 3) setFormStep(formStep + 1)
  }

  const prevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1)
  }

  const canProceedStep1 =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.country &&
    (formData.country !== "Other" || formData.otherCountry)
  const canProceedStep2 =
    formData.studentAge &&
    formData.gradeLevel &&
    formData.curriculum &&
    formData.subjects.length > 0
  const canSubmit = formData.preferredDays.length > 0 && formData.preferredTime

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">🎉 Thank You!</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Your request has been submitted successfully! 
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Click the WhatsApp button below to continue the conversation and schedule your FREE trial class.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-green-600 hover:bg-green-700 rounded-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all whatsapp-pulse">
                <a
                  href={generateWhatsAppUrl(formData, "sales-page")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Continue on WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Gift className="h-6 w-6 text-secondary" />
                Book Your FREE Trial Class
              </DialogTitle>
            </DialogHeader>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      formStep >= s
                        ? "bg-secondary text-secondary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {formStep > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 w-16 sm:w-24 mx-2 rounded-full transition-all ${
                        formStep > s ? "bg-secondary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Contact Information */}
            {formStep === 1 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-secondary" />
                    Parent & Student Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about yourself and your child
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Parent&apos;s Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Adeyemi"
                      className="h-12 border-2 bg-background focus:border-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="h-12 border-2 bg-background focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      WhatsApp Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+44 7123 456789"
                      className="h-12 border-2 bg-background focus:border-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Country of Residence
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          country: v,
                          otherCountry: v !== "Other" ? "" : formData.otherCountry,
                        })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 bg-background">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {COUNTRIES.map((country) => (
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
                        onChange={(e) =>
                          setFormData({ ...formData, otherCountry: e.target.value })
                        }
                        placeholder="Please specify your country"
                        className="h-12 border-2 bg-background focus:border-secondary mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t">
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedStep1}
                    className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
                  >
                    Continue to Student Details
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Student Details */}
            {formStep === 2 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <GraduationCap className="h-5 w-5 text-secondary" />
                    Student Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your child&apos;s education
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="studentAge"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Child&apos;s Age
                    </Label>
                    <Select
                      value={formData.studentAge}
                      onValueChange={(v) =>
                        setFormData({ ...formData, studentAge: v })
                      }
                    >
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
                    <Label
                      htmlFor="gradeLevel"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Grade/Year
                    </Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gradeLevel: v })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 bg-background">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="curriculum"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      Curriculum
                    </Label>
                    <Select
                      value={formData.curriculum}
                      onValueChange={(v) =>
                        setFormData({ ...formData, curriculum: v })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 bg-background">
                        <SelectValue placeholder="Curriculum" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRICULA.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    What would you like your child to learn?
                  </Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SUBJECTS.map((subject) => (
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
                </div>

                <div className="mt-8 pt-4 border-t flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
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
            {formStep === 3 && (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Schedule & Goals
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select preferred days, time, and your learning goal
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Preferred Days
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
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
                  <Label
                    htmlFor="preferredTime"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Preferred Time (Your Local Time)
                  </Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(v) =>
                      setFormData({ ...formData, preferredTime: v })
                    }
                  >
                    <SelectTrigger className="h-12 border-2 bg-background">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Learning Goal */}
                <div className="space-y-2">
                  <Label
                    htmlFor="learningGoal"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Target className="h-4 w-4 text-muted-foreground" />
                    Learning Goal (Optional)
                  </Label>
                  <Textarea
                    id="learningGoal"
                    value={formData.learningGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, learningGoal: e.target.value })
                    }
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
                      <p className="font-semibold text-foreground">
                        Your First Class is FREE!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No payment required. Try us risk-free and see your child shine!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
