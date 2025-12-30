// Centralized content management for easy maintenance

export interface BlogPost {
  id: string
  title: string
  description: string
  thumbnail: string
  author: string
  date: string
  mediumLink: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface SocialLink {
  name: string
  url: string
  icon: "facebook" | "instagram" | "twitter" | "medium"
}

export interface Stat {
  value: string
  label: string
}

export interface Subject {
  name: string
  icon: string
  description: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
}

export interface WhyChooseFeature {
  icon: string
  title: string
  description: string
}

export interface PricingPlan {
  name: string
  price: string
  features: string[]
  popular?: boolean
}

export interface Testimonial {
  name: string
  location: string
  text: string
  rating: number
}

// Website Content
export const websiteContent = {
  hero: {
    title: "Quality Online Tutoring for Ages 3-16",
    subtitle: "Connecting Nigerian & African Children in Diaspora with Expert Tutors",
    description:
      "Give your child the gift of quality education from anywhere in the world. Expert one-on-one tutoring in academics, languages, IT skills, and more.",
    ctaPrimary: "Book a Free Trial",
    ctaSecondary: "Explore Subjects",
  },

  stats: [
    { value: "500+", label: "Students Taught" },
    { value: "50+", label: "Expert Tutors" },
    { value: "98%", label: "Success Rate" },
    { value: "20+", label: "Subjects Offered" },
  ] as Stat[],

  subjects: [
    {
      name: "Mathematics",
      icon: "calculator",
      description: "Build strong foundations in numeracy and problem-solving",
    },
    {
      name: "English Language",
      icon: "book",
      description: "Develop reading, writing, and communication skills",
    },
    {
      name: "Sciences",
      icon: "microscope",
      description: "Biology, Chemistry, and Physics for all levels",
    },
    {
      name: "Nigerian Languages",
      icon: "languages",
      description: "Learn Igbo, Yoruba, and connect with your roots",
    },
    {
      name: "Foreign Languages",
      icon: "globe",
      description: "Master French and Spanish with native speakers",
    },
    {
      name: "IT & Coding",
      icon: "laptop",
      description: "Future-proof skills in programming and technology",
    },
    {
      name: "Music Lessons",
      icon: "music",
      description: "Learn instruments and develop musical talent",
    },
    {
      name: "Exam Prep",
      icon: "award",
      description: "Cambridge, SAT, WAEC, JAMB, and more",
    },
  ] as Subject[],

  howItWorks: [
    {
      step: 1,
      title: "Find Your Tutor",
      description:
        "Browse our expert tutors or let us match you with the perfect fit based on your child's needs, learning style, and schedule.",
    },
    {
      step: 2,
      title: "Book a Free Trial",
      description:
        "Schedule a complimentary trial lesson to experience our teaching quality and ensure it's the right match for your child.",
    },
    {
      step: 3,
      title: "Start Learning",
      description:
        "Begin personalized one-on-one lessons with flexible scheduling, interactive resources, and continuous progress tracking.",
    },
    {
      step: 4,
      title: "Track Progress",
      description:
        "Receive detailed monthly reports, access lesson recordings, and stay informed about your child's academic journey.",
    },
  ] as HowItWorksStep[],

  whyChoose: [
    {
      icon: "users",
      title: "Expert Nigerian Tutors",
      description:
        "Qualified teachers who understand both the curriculum and the unique challenges of diaspora children.",
    },
    {
      icon: "calendar",
      title: "Flexible Scheduling",
      description:
        "Book lessons that fit your family's schedule across different time zones - UK, US, Canada, and more.",
    },
    {
      icon: "video",
      title: "Interactive Learning",
      description: "Engaging one-on-one sessions with multimedia resources, quizzes, and real-time feedback.",
    },
    {
      icon: "chart",
      title: "Monthly Progress Reports",
      description: "Comprehensive assessments and detailed reports to track your child's development and achievements.",
    },
    {
      icon: "currency",
      title: "Flexible Payments",
      description: "Pay in Naira or your local currency with secure, convenient payment options that work for you.",
    },
    {
      icon: "gift",
      title: "Free Weekly Classes",
      description:
        "Access complimentary group classes every week to supplement your child's learning at no extra cost.",
    },
  ] as WhyChooseFeature[],

  pricing: [
    {
      name: "Starter",
      price: "₦15,000/month",
      features: [
        "4 one-on-one sessions per month",
        "1 subject of choice",
        "Monthly progress report",
        "WhatsApp support",
        "Free weekly group classes",
      ],
    },
    {
      name: "Standard",
      price: "₦28,000/month",
      features: [
        "8 one-on-one sessions per month",
        "2 subjects of choice",
        "Bi-weekly progress reports",
        "Priority WhatsApp support",
        "Free weekly group classes",
        "Lesson recordings access",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "₦50,000/month",
      features: [
        "16 one-on-one sessions per month",
        "Unlimited subjects",
        "Weekly progress reports",
        "24/7 WhatsApp support",
        "Free weekly group classes",
        "Lesson recordings access",
        "Exam preparation materials",
        "Parent-teacher consultations",
      ],
    },
  ] as PricingPlan[],

  testimonials: [
    {
      name: "Chioma Okafor",
      location: "London, UK",
      text: "My daughter struggled with Mathematics before we found D-lighter Tutor. Now she's at the top of her class! The tutors are patient, knowledgeable, and truly care about her progress.",
      rating: 5,
    },
    {
      name: "Emeka Johnson",
      location: "Texas, USA",
      text: "As parents in the diaspora, we wanted our kids to stay connected to their Nigerian roots. The Igbo language classes have been phenomenal, and the IT skills training is preparing them for the future.",
      rating: 5,
    },
    {
      name: "Ngozi Williams",
      location: "Toronto, Canada",
      text: "The flexibility is incredible! We're able to schedule lessons around our busy lives, and the monthly reports keep us informed. The free weekly classes are an amazing bonus.",
      rating: 5,
    },
    {
      name: "Adebayo Thompson",
      location: "Manchester, UK",
      text: "My son passed his Cambridge checkpoint exams with flying colors thanks to D-lighter Tutor. The one-on-one attention and exam preparation materials made all the difference.",
      rating: 5,
    },
  ] as Testimonial[],

  faqs: [
    {
      question: "What age groups do you teach?",
      answer:
        "We provide online tutoring for children aged 3-16, covering early years education through to GCSE/O-Level preparation. Our tutors tailor lessons to match each child's developmental stage and learning needs.",
    },
    {
      question: "How do I book a free trial lesson?",
      answer:
        "Simply click on any 'Book a Free Trial' button on our website, and you'll be redirected to WhatsApp where our team will help you schedule a complimentary trial lesson with a tutor that matches your needs.",
    },
    {
      question: "Can I schedule classes in my time zone?",
      answer:
        "We work with families across UK, US, Canada, UAE, and Saudi Arabia. Our tutors are flexible and can accommodate your preferred time zone for all lessons.",
    },
    {
      question: "What subjects do you offer?",
      answer:
        "We offer Mathematics, English, Sciences (Biology, Chemistry, Physics), Nigerian Languages (Igbo, Yoruba), Foreign Languages (French, Spanish), IT & Coding, Music, and comprehensive exam preparation for Cambridge, SAT, WAEC, JAMB, and more.",
    },
    {
      question: "How are tutors matched to my child?",
      answer:
        "We carefully match tutors based on your child's learning style, subject needs, personality, and goals. You can also browse our tutor profiles and request specific tutors that align with your preferences.",
    },
    {
      question: "Can I pay in my local currency?",
      answer:
        "Yes! While our prices are displayed in Naira, we accept payments in various currencies including GBP, USD, CAD, and more. Contact us via WhatsApp to discuss payment options that work best for you.",
    },
    {
      question: "What happens if I miss a scheduled class?",
      answer:
        "We understand life gets busy! If you need to reschedule a class, simply notify us at least 24 hours in advance, and we'll work with your tutor to find an alternative time that works for everyone.",
    },
    {
      question: "How do I track my child's progress?",
      answer:
        "You'll receive detailed monthly progress reports that include assessment results, areas of strength, areas for improvement, and personalized recommendations. Plus, you can access lesson recordings to see your child's learning journey firsthand.",
    },
    {
      question: "Are the tutors qualified?",
      answer:
        "Yes! All our tutors are highly qualified, experienced educators with relevant certifications and teaching credentials. Many are Nigerian teachers who understand both international curricula and the unique needs of diaspora children.",
    },
    {
      question: "What platform do you use for lessons?",
      answer:
        "We primarily use Zoom for our interactive one-on-one lessons, which provides excellent video quality, screen sharing, and recording capabilities. We'll guide you through the setup process to ensure a smooth learning experience.",
    },
  ] as FAQ[],

  blogs: [
    {
      id: "1",
      title: "5 Ways to Keep Your Child Connected to Nigerian Culture from Abroad",
      description:
        "Discover practical strategies for maintaining cultural connections while raising Nigerian children in the diaspora. From language learning to cultural celebrations, we share expert tips for keeping your heritage alive.",
      thumbnail: "/placeholder.svg?height=400&width=600",
      author: "D-lighter Tutor Team",
      date: "January 15, 2025",
      mediumLink: "https://medium.com/@dlightertutor",
    },
    {
      id: "2",
      title: "The Ultimate Guide to Cambridge Checkpoint Exams: What Parents Need to Know",
      description:
        "Everything you need to know about Cambridge Checkpoint examinations, including preparation tips, assessment structure, and how to support your child through the process. Essential reading for diaspora parents.",
      thumbnail: "/placeholder.svg?height=400&width=600",
      author: "D-lighter Tutor Team",
      date: "January 10, 2025",
      mediumLink: "https://medium.com/@dlightertutor",
    },
    {
      id: "3",
      title: "Why Learning Nigerian Languages Benefits Your Child's Development",
      description:
        "Explore the cognitive, cultural, and social benefits of bilingual education. Learn how teaching your children Igbo or Yoruba enhances their overall development and strengthens family bonds.",
      thumbnail: "/placeholder.svg?height=400&width=600",
      author: "D-lighter Tutor Team",
      date: "January 5, 2025",
      mediumLink: "https://medium.com/@dlightertutor",
    },
  ] as BlogPost[],

  socialLinks: [
    {
      name: "Facebook",
      url: "https://www.facebook.com/dlightertutor",
      icon: "facebook",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/dlightertutor",
      icon: "instagram",
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/dlightertutor",
      icon: "twitter",
    },
    {
      name: "Medium",
      url: "https://medium.com/@dlightertutor",
      icon: "medium",
    },
  ] as SocialLink[],

  contact: {
    phone: "+2348129517392",
    whatsapp: "https://wa.me/2348129517392",
    email: "support@d-lightertutor.com",
  },

  tutorRecruitment: {
    title: "Join Our Team of Expert Tutors",
    subtitle: "Make a Difference in the Lives of Diaspora Children",
    description:
      "Are you a passionate, qualified educator who wants to help Nigerian children succeed academically? Join our growing team of expert tutors and work with students from around the world.",
    features: [
      "Flexible working hours",
      "Competitive compensation",
      "Work from anywhere",
      "Professional development opportunities",
      "Supportive teaching community",
      "Make a real impact",
    ],
    cta: "Apply to Become a Tutor",
  },
}
