"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MessageCircle,
  CheckCircle,
  CheckCircle2,
  Star,
  Users,
  Globe,
  BookOpen,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Gift,
  Mail,
  Play,
  Target,
  Heart,
  Zap,
  ChevronDown,
  X,
  GraduationCap,
  TrendingUp,
  FileText,
  CalendarCheck,
  BadgeCheck,
  User,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const subjects = [
  "Mathematics",
  "English Language",
  "Sciences (Biology, Chemistry, Physics)",
  "Yoruba",
  "Igbo",
  "Hausa",
  "French",
  "Spanish",
  "Tech Skills (Coding, AI, Graphics, Animation, ICT)",
  "Music (Piano, Guitar)",
  "Exam Prep (11+, SAT, GCSE, IGCSE)",
]

const gradeLevels = [
  "Nursery (Ages 3-4)",
  "Reception (Age 4-5)",
  "Year 1 (Age 5-6)",
  "Year 2 (Age 6-7)",
  "Year 3 (Age 7-8)",
  "Year 4 (Age 8-9)",
  "Year 5 (Age 9-10)",
  "Year 6 (Age 10-11)",
  "Year 7 (Age 11-12)",
  "Year 8 (Age 12-13)",
  "Year 9 (Age 13-14)",
  "Year 10 (Age 14-15)",
  "Year 11 (Age 15-16)",
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

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
]

const curricula = [
  "British Curriculum",
  "American Curriculum",
  "Nigerian Curriculum",
  "International Baccalaureate (IB)",
  "Cambridge (IGCSE)",
  "Other",
]

const reviewImages = [
  "/images/review-1.png",
  "/images/review-2.png",
  "/images/review-3.png",
  "/images/review-4.png",
  "/images/review-5.png",
  "/images/review-6.png",
]

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentAge: "",
    subjects: [] as string[],
    gradeLevel: "",
    country: "",
    otherCountry: "",
    preferredDays: [] as string[],
    preferredTime: "",
    curriculum: "",
    learningGoal: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        setIsSubmitted(true)
        toast.success("🎉 Request Submitted Successfully!", {
          description: "We've received your request and sent a confirmation to your email. Our team will contact you within 24 hours.",
          duration: 8000,
        })
        // Open WhatsApp as backup
        if (leadData.data?.whatsappUrl) {
          window.open(leadData.data.whatsappUrl, "_blank")
        }
      } else {
        // Email failed but lead was saved - still show success but warn
        setIsSubmitted(true)
        toast.warning("Request Received!", {
          description: "We've saved your request. Our team will contact you shortly via WhatsApp.",
          duration: 6000,
        })
        if (leadData.data?.whatsappUrl) {
          window.open(leadData.data.whatsappUrl, "_blank")
        }
      }
    } catch {
      toast.error("Submission Failed", {
        description: "Please try again or contact us directly on WhatsApp.",
        duration: 5000,
      })
      setError("Failed to submit. Please try again or contact us directly on WhatsApp.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setFormStep(1)
    setIsSubmitted(false)
    setError("")
  }

  const nextStep = () => {
    if (formStep < 3) setFormStep(formStep + 1)
  }

  const prevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1)
  }

  const canProceedStep1 = formData.name && formData.email && formData.phone && formData.country && (formData.country !== "Other" || formData.otherCountry)
  const canProceedStep2 = formData.studentAge && formData.gradeLevel && formData.curriculum && formData.subjects.length > 0
  const canSubmit = formData.preferredDays.length > 0 && formData.preferredTime

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky CTA Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 400 ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-primary-foreground font-medium hidden sm:block">
              Give your child the academic edge they deserve
            </p>
            <div className="flex items-center gap-2">
              <Button 
                onClick={openModal}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full font-semibold"
              >
                Book Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline"
                  className="border-white/50 bg-white/10 text-white hover:bg-white/20 rounded-full font-semibold"
                >
                  <MessageCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] h-24 w-24 rounded-full bg-secondary/20 blur-xl animate-pulse" />
          <div className="absolute top-40 right-[15%] h-32 w-32 rounded-full bg-accent/20 blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-32 left-[20%] h-20 w-20 rounded-full bg-secondary/15 blur-lg animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-20 right-[25%] h-16 w-16 rounded-full bg-accent/15 blur-lg animate-pulse" style={{ animationDelay: "1.5s" }} />
          {/* Floating icons */}
          <div className="absolute top-32 right-[30%] animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "3s" }}>
            <GraduationCap className="h-8 w-8 text-secondary/30" />
          </div>
          <div className="absolute bottom-40 left-[30%] animate-bounce" style={{ animationDelay: "0.7s", animationDuration: "4s" }}>
            <BookOpen className="h-6 w-6 text-accent/30" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              {/* Limited Offer Badge */}
              <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 px-5 py-2.5 rounded-full mb-6 animate-pulse">
                <Gift className="h-4 w-4 text-secondary" />
                <span className="text-sm font-bold text-secondary">LIMITED TIME: First Trial Class is FREE!</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
                Expert Tutoring for{" "}
                <span className="relative inline-block">
                  <span className="text-secondary">African Children</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-secondary/50" />
                  </svg>
                </span>
                <br className="hidden sm:block" />
                <span className="text-primary-foreground/90">in the Diaspora</span>
              </h1>

              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 max-w-3xl mx-auto leading-relaxed">
                We support <strong>Nigerian and African parents</strong> in the UK, US, Canada, and beyond with{" "}
                <strong>personalized 1-on-1 online tutoring</strong> for learners aged <strong>3 to 16 years</strong>.
              </p>
              
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Designed to fit your schedule • Tailored to your child&apos;s curriculum • Trained professionals in early childhood education
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  onClick={openModal}
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-16 px-10 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all hover:-translate-y-1 hover:scale-105"
                >
                  <Gift className="mr-2 h-6 w-6" />
                  Get Your Free Trial Class
                </Button>
                <a
                  href="https://wa.me/2348129517392"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg h-16 px-8 rounded-full font-semibold w-full sm:w-auto transition-all hover:-translate-y-0.5"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>100% Satisfaction Guaranteed</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { number: "98%", label: "Parent Satisfaction", icon: Star },
                  { number: "50+", label: "Expert Tutors", icon: GraduationCap },
                  { number: "5+", label: "Countries Served", icon: Globe },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                    <stat.icon className="h-5 w-5 text-secondary mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.number}</p>
                    <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-primary-foreground/50" />
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-background w-full h-16">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Is Your Child <span className="text-destructive">Struggling</span> with...
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {[
                "Keeping up with school curriculum?",
                "Low confidence in class?",
                "Homework battles every evening?",
                "Losing touch with African languages?",
                "Preparing for important exams?",
                "Finding quality tutors who understand them?",
              ].map((problem, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-left">
                  <X className="h-5 w-5 text-destructive shrink-0" />
                  <span className="text-foreground">{problem}</span>
                </div>
              ))}
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              You&apos;re not alone. Many African parents in the diaspora face these exact challenges.
            </p>
            <p className="text-2xl font-semibold text-foreground mb-8">
              But there&apos;s a <span className="text-secondary">better way</span>...
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">The D-lighter Difference</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Expert Tutoring Designed for <span className="text-secondary">African Children</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We combine academic excellence with cultural understanding to help your child thrive
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: GraduationCap,
                  title: "Experienced Nigerian Tutors",
                  description: "All our tutors are qualified educators with proven track records. They understand your child's cultural background and learning style.",
                  color: "bg-blue-500",
                },
                {
                  icon: Target,
                  title: "True One-on-One Sessions",
                  description: "No group classes. Your child gets 100% focused attention in every session, ensuring faster progress and better results.",
                  color: "bg-green-500",
                },
                {
                  icon: Globe,
                  title: "African Languages & Culture",
                  description: "Keep your children connected to their roots. We offer Yoruba, Igbo, Hausa, and other African language classes.",
                  color: "bg-purple-500",
                },
                {
                  icon: Clock,
                  title: "Flexible Scheduling",
                  description: "Classes available across UK, US, Canada, and UAE time zones. Reschedule with 24-hour notice — no questions asked.",
                  color: "bg-orange-500",
                },
                {
                  icon: FileText,
                  title: "Monthly Progress Reports",
                  description: "Know exactly how your child is progressing. Receive detailed reports with assessment scores and tutor feedback.",
                  color: "bg-pink-500",
                },
                {
                  icon: Shield,
                  title: "Pay-As-You-Go Model",
                  description: "No upfront packages or long-term commitments. Pay only for completed hours at month-end in NGN, GBP, or USD.",
                  color: "bg-teal-500",
                },
              ].map((feature, i) => (
                <div key={i} className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center mt-12">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It <span className="text-secondary">Works</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Getting started is simple — your child could be learning within 24 hours
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Book Your Trial", description: "Fill our quick form. Tell us about your child and their needs.", icon: CalendarCheck },
                { step: "2", title: "Get Matched", description: "We pair your child with the perfect tutor based on subject and personality.", icon: Users },
                { step: "3", title: "Free Trial Class", description: "Experience a full lesson at no cost. See the D-lighter difference firsthand.", icon: Play },
                { step: "4", title: "Start Learning", description: "If you love it (and you will!), continue with regular scheduled classes.", icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary text-secondary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-secondary/30" />
                  )}
                  <item.icon className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center mt-12">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Image Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full mb-4">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">Loved by Parents</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What <span className="text-secondary">Parents Are Saying</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Real stories from real families who&apos;ve seen real results
              </p>
            </div>

            {/* Review Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {reviewImages.map((src, i) => (
                <div 
                  key={i} 
                  className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <Image
                    src={src}
                    alt={`Parent review ${i + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center mt-12">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Video Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
                <Play className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">See Us In Action</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Watch a <span className="text-secondary">Live Class</span> in Action
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience how our tutors engage and inspire students
              </p>
            </div>

            {/* Video Embed */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-card border shadow-2xl">
              <iframe
                src="https://www.youtube.com/embed/iZ3gRJyMOpw"
                title="D-lighter Tutor Class Session"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center mt-12">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary/20 mb-6">
              <BadgeCheck className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="text-secondary">100% Satisfaction</span> Guarantee
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you&apos;re not completely satisfied after your child&apos;s first paid month, we&apos;ll give you a full refund. No questions asked. That&apos;s how confident we are in our tutors.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              {["No Long-Term Contracts", "Cancel Anytime", "Pay-As-You-Go", "Money-Back Guarantee"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-secondary">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How do I know if a tutor is right for my child?",
                  a: "That's what the FREE trial is for! Your child will have a full lesson with their matched tutor. If it's not a perfect fit, we'll find another tutor at no extra cost.",
                },
                {
                  q: "What technology do I need?",
                  a: "Just a computer/tablet with internet, a camera, and a microphone. We use Zoom or Google Meet. Our tutors can help you get set up!",
                },
                {
                  q: "Can I change the schedule after starting?",
                  a: "Absolutely! Life happens. You can reschedule any class with 24-hour notice. We're flexible because we know you are too.",
                },
                {
                  q: "Do you help with homework?",
                  a: "Yes! Tutors can help with homework, school projects, and exam preparation. Many parents book extra sessions during exam periods.",
                },
                {
                  q: "What if my child needs help with multiple subjects?",
                  a: "We can match you with tutors for each subject, or find a versatile tutor if subjects are related. Multi-subject families often get scheduling priority.",
                },
              ].map((faq, i) => (
                <div key={i} className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center mt-10">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 px-4 sm:px-8 rounded-full font-bold shadow-lg shadow-secondary/30 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Book Free Trial</span>
                <span className="sm:hidden">Free Trial</span>
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 sm:h-14 px-4 sm:px-8 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Chat on WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary/95 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />
          <div className="absolute bottom-10 right-[10%] h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Give Your Child the <span className="text-secondary">Academic Edge?</span>
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10">
              Join families across the UK, USA, Canada, and UAE who have transformed their children&apos;s education with D-lighter Tutor. Start with a FREE trial class today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={openModal}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg h-16 px-10 rounded-full font-bold shadow-lg shadow-secondary/30"
              >
                <Gift className="mr-2 h-6 w-6" />
                Book Your Free Trial Now
              </Button>
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground/30 bg-white/10 text-white hover:bg-white/20 rounded-full font-semibold text-lg h-16 px-10 rounded-full font-bold w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 text-primary-foreground/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-foreground/80">
              <a
                href="https://wa.me/2348129517392"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp: +234 812 951 7392
              </a>
              <a href="mailto:hello@dlightertutor.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="h-5 w-5" />
                hello@dlightertutor.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            © {new Date().getFullYear()} D-lighter Tutor. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <a href="mailto:hello@dlightertutor.com" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="p-8 text-center">
              <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your request has been submitted. We&apos;ve opened WhatsApp so you can chat with us directly.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Our team will contact you within 24 hours to schedule your child&apos;s FREE trial class.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="bg-green-600 hover:bg-green-700 rounded-full">
                  <a href="https://wa.me/2348129517392" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Continue on WhatsApp
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">
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
                    <p className="text-sm text-muted-foreground">Tell us about your child&apos;s education</p>
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
                          {gradeLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
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
                          {curricula.map((curr) => (
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
                    <p className="text-sm text-muted-foreground">Select preferred days, time, and your learning goal</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Preferred Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
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
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
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
    </div>
  )
}
