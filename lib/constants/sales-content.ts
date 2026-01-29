// Sales page specific content constants

export const HERO_STATS = [
  { number: "98%", label: "Parent Satisfaction", icon: "Star" },
  { number: "50+", label: "Expert Tutors", icon: "GraduationCap" },
  { number: "5+", label: "Countries Served", icon: "Globe" },
] as const

export const TRUST_INDICATORS = [
  "No Credit Card Required",
  "Cancel Anytime",
  "100% Satisfaction Guaranteed",
] as const

export const PROBLEMS = [
  "Keeping up with school curriculum?",
  "Low confidence in class?",
  "Homework battles every evening?",
  "Losing touch with African languages?",
  "Preparing for important exams?",
  "Finding quality tutors who understand them?",
] as const

// How We Help Children Turn Confusion into Confidence
export const HOW_WE_HELP_FEATURES = [
  {
    icon: "Target",
    title: "Understand concepts clearly",
    description: "not just memorise",
    color: "bg-blue-500",
  },
  {
    icon: "GraduationCap",
    title: "Stay aligned with school",
    description: "and exam requirements",
    color: "bg-green-500",
  },
  {
    icon: "Shield",
    title: "Build confidence",
    description: "and independence",
    color: "bg-purple-500",
  },
  {
    icon: "FileText",
    title: "Improve grades",
    description: "step by step",
    color: "bg-orange-500",
  },
] as const

// What Your Child Can Learn With Us
export const LEARNING_AREAS = [
  {
    icon: "FileText",
    title: "Schoolwork & assignments",
    description: "Complete support for daily school requirements",
    color: "bg-blue-500",
  },
  {
    icon: "GraduationCap",
    title: "Exam preparation",
    description: "11+, SAT, IGCSE, SNSA, NQS",
    color: "bg-green-500",
  },
  {
    icon: "Globe",
    title: "Language learning",
    description: "Igbo, Yoruba, French & Spanish",
    color: "bg-purple-500",
  },
  {
    icon: "Target",
    title: "ICT & digital skills",
    description: "Modern technology education",
    color: "bg-orange-500",
  },
  {
    icon: "Clock",
    title: "Music lessons",
    description: "Creative arts and musical education",
    color: "bg-pink-500",
  },
] as const

// Keep original for backward compatibility
export const SOLUTION_FEATURES = [
  {
    icon: "GraduationCap",
    title: "Experienced Nigerian Tutors",
    description: "All our tutors are qualified educators with proven track records. They understand your child's cultural background and learning style.",
    color: "bg-blue-500",
  },
  {
    icon: "Target",
    title: "True One-on-One Sessions",
    description: "No group classes. Your child gets 100% focused attention in every session, ensuring faster progress and better results.",
    color: "bg-green-500",
  },
  {
    icon: "Globe",
    title: "African Languages & Culture",
    description: "Keep your children connected to their roots. We offer Yoruba, Igbo, Hausa, and other African language classes.",
    color: "bg-purple-500",
  },
  {
    icon: "Clock",
    title: "Flexible Scheduling",
    description: "Classes available across UK, US, Canada, and UAE time zones. Reschedule with 24-hour notice — no questions asked.",
    color: "bg-orange-500",
  },
  {
    icon: "FileText",
    title: "Monthly Progress Reports",
    description: "Know exactly how your child is progressing. Receive detailed reports with assessment scores and tutor feedback.",
    color: "bg-pink-500",
  },
  {
    icon: "Shield",
    title: "Pay-As-You-Go Model",
    description: "No upfront packages or long-term commitments. Pay only for completed hours at month-end in NGN, GBP, or USD.",
    color: "bg-teal-500",
  },
] as const

export const HOW_IT_WORKS_STEPS = [
  { step: "1", title: "Book Your Trial", description: "Fill our quick form. Tell us about your child and their needs.", icon: "CalendarCheck" },
  { step: "2", title: "Get Matched", description: "We pair your child with the perfect tutor based on subject and personality.", icon: "Users" },
  { step: "3", title: "Free Trial Class", description: "Experience a full lesson at no cost. See the D-lighter difference firsthand.", icon: "Play" },
  { step: "4", title: "Start Learning", description: "If you love it (and you will!), continue with regular scheduled classes.", icon: "TrendingUp" },
] as const

export const REVIEW_IMAGES = [
  "/images/review-1.png",
  "/images/review-2.png",
  "/images/review-3.png",
  "/images/review-4.png",
  "/images/review-5.png",
  "/images/review-6.png",
] as const

export const GUARANTEE_ITEMS = [
  "No Long-Term Contracts",
  "Cancel Anytime",
  "Pay-As-You-Go",
  "Money-Back Guarantee",
] as const

export const FAQ_ITEMS = [
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
] as const

// YouTube video
export const YOUTUBE_VIDEO_ID = "iZ3gRJyMOpw"
export const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`
