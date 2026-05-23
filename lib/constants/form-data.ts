// Shared form data constants — DRY principle
// Used by booking-form-modal.tsx and sales page components

// ─── Subjects (from enrolment form screenshots) ──────────────────────────────
export const FORM_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Coding / Programming",
  "Music",
  "French",
  "Igbo",
  "Yoruba",
  "Science",
] as const

// Legacy alias kept for sales page components
export const SUBJECTS = FORM_SUBJECTS

// ─── Exam types ───────────────────────────────────────────────────────────────
export const EXAM_TYPES = [
  "GCSE",
  "IGCSE",
  "SAT",
  "11+",
  "Entrance Exams",
  "School Exams",
  "Not currently preparing for exams",
] as const

// ─── GCSE subject/board/tier options ─────────────────────────────────────────
export const GCSE_OPTIONS = [
  // Maths
  "Maths Eduqas Higher Tier",
  "Maths Eduqas Foundation",
  "Maths AQA Foundation",
  "Maths AQA Higher Tier",
  "Maths Edexcel Foundation",
  "Maths Edexcel Higher Tier",
  "Maths OCR Foundation",
  "Maths OCR Higher Tier",
  "Maths CCEA Foundation",
  "Maths CCEA Higher Tier",
  // English
  "English AQA",
  "English Edexcel",
  "English OCR",
  "English Eduqas",
  // Combined Science (Trilogy)
  "AQA Combined Science Trilogy HIGHER TIER",
  "AQA Combined Science Trilogy FOUNDATION",
  "Edexcel Combined Science Trilogy FOUNDATION",
  "Edexcel Combined Science Trilogy HIGHER TIER",
  "OCR Combined Science Trilogy FOUNDATION",
  "OCR Combined Science Trilogy HIGHER TIER",
  "EDUQAS Combined/Applied Science FOUNDATION TIER",
  "EDUQAS Combined/Applied Science HIGHER TIER",
  // Triple Science
  "AQA Triple Science (Biology, Physics & Chemistry) HIGHER TIER",
  "AQA Triple Science (Biology, Physics & Chemistry) FOUNDATION",
  "EDEXCEL Triple Science (Biology, Physics & Chemistry) HIGHER TIER",
  "EDEXCEL Triple Science (Biology, Physics & Chemistry) FOUNDATION",
  "OCR Triple Science (Biology, Physics & Chemistry) HIGHER TIER",
  "OCR Triple Science (Biology, Physics & Chemistry) FOUNDATION",
  "EDUQAS Triple Science (Biology, Physics & Chemistry) HIGHER TIER",
  "EDUQAS Triple Science (Biology, Physics & Chemistry) FOUNDATION",
  // Computer Science
  "Computer Science EDEXCEL",
  "Computer Science AQA",
  "Computer Science OCR",
  "Computer Science EDUQAS",
] as const

// ─── Referral sources ─────────────────────────────────────────────────────────
export const REFERRAL_SOURCES = [
  "Website",
  "Google Search",
  "Instagram",
  "WhatsApp",
  "Referral",
  "Facebook",
] as const

// ─── Grade levels ─────────────────────────────────────────────────────────────
export const GRADE_LEVELS = [
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
] as const

// ─── Countries ────────────────────────────────────────────────────────────────
export const COUNTRIES = [
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
] as const

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

export const TIME_SLOTS = [
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
] as const

export const CURRICULA = [
  "British Curriculum",
  "American Curriculum",
  "Nigerian Curriculum",
  "International Baccalaureate (IB)",
  "Cambridge (IGCSE)",
  "Other",
] as const

// ─── Full enrolment form data type ────────────────────────────────────────────
export interface EnrollmentFormData {
  // Step 1 — Parent Info
  parentName: string
  parentEmail: string
  parentPhone: string
  parentCountry: string
  parentOtherCountry: string
  // Step 1 — Learner Info
  learnerName: string
  learnerEmail: string
  learnerAge: string
  learnerGrade: string
  learnerSchool: string
  learnerCountry: string
  // Step 2 — Subjects
  subjects: string[]
  otherSubject: string
  // Step 2 — Exam Prep
  examType: string
  otherExamType: string
  examDate: string
  gcseSubjects: string[]
  otherGcseSubject: string
  // Step 3 — Learning Needs
  weakAreas: string
  learningGoals: string
  // Step 3 — Tester Session
  testerDate: string
  testerTime: string
  testerAmPm: string
  // Step 3 — Weekly Schedule
  preferredDays: string[]
  preferredClassTime: string
  hoursPerWeek: string
  // Step 4 — Additional Info
  urgentNeeds: string
  specificResources: string
  additionalInfo: string
  // Step 4 — Referral
  referralSource: string
  otherReferralSource: string
  // Meta
  plan?: string
}

export const INITIAL_ENROLLMENT_FORM_DATA: EnrollmentFormData = {
  parentName: "", parentEmail: "", parentPhone: "", parentCountry: "", parentOtherCountry: "",
  learnerName: "", learnerEmail: "", learnerAge: "", learnerGrade: "", learnerSchool: "", learnerCountry: "",
  subjects: [], otherSubject: "",
  examType: "", otherExamType: "", examDate: "", gcseSubjects: [], otherGcseSubject: "",
  weakAreas: "", learningGoals: "",
  testerDate: "", testerTime: "", testerAmPm: "AM",
  preferredDays: [], preferredClassTime: "", hoursPerWeek: "",
  urgentNeeds: "", specificResources: "", additionalInfo: "",
  referralSource: "", otherReferralSource: "",
  plan: "",
}

// Legacy alias — used by sales page components
export interface BookingFormData {
  name: string
  email: string
  phone: string
  studentAge: string
  subjects: string[]
  gradeLevel: string
  country: string
  otherCountry: string
  preferredDays: string[]
  preferredTime: string
  curriculum: string
  learningGoal: string
  plan?: string
}

export const INITIAL_FORM_DATA: BookingFormData = {
  name: "", email: "", phone: "", studentAge: "", subjects: [],
  gradeLevel: "", country: "", otherCountry: "", preferredDays: [],
  preferredTime: "", curriculum: "", learningGoal: "", plan: "",
}

// ─── Contact constants ────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "2348129517392"
export const WHATSAPP_URL = `https://wa.link/uo1rq2`
export const CONTACT_EMAIL = "hello@dlightertutor.com"

