// Shared form data constants - DRY principle
// Used by booking-form-modal.tsx and sales page components

export const SUBJECTS = [
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
] as const

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

// Form data type
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

// Initial form state
export const INITIAL_FORM_DATA: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  studentAge: "",
  subjects: [],
  gradeLevel: "",
  country: "",
  otherCountry: "",
  preferredDays: [],
  preferredTime: "",
  curriculum: "",
  learningGoal: "",
  plan: "",
}

// WhatsApp contact
export const WHATSAPP_NUMBER = "2348129517392"
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

// Email contact
export const CONTACT_EMAIL = "hello@dlightertutor.com"
