import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// WhatsApp phone number for D-lighter Tutor
const WHATSAPP_NUMBER = "2348129517392"

// Generate WhatsApp URL with pre-filled message
export function generateWhatsAppUrl(formData: any, source?: string): string {
  const finalCountry = formData.country === "Other" && formData.otherCountry 
    ? formData.otherCountry 
    : formData.country

  const sourceText = source === "main-page" ? "MAIN WEBSITE" : "SALES PAGE"
  
  const whatsappMessage = `
🎓 *NEW BOOKING REQUEST FROM ${sourceText}*

👤 *Parent Details:*
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Country: ${finalCountry}

👨‍🎓 *Student Details:*
Age: ${formData.studentAge}
Grade/Class: ${formData.gradeLevel}
Subjects: ${formData.subjects?.join(", ") || "Not specified"}
Curriculum: ${formData.curriculum}
${formData.plan ? `Plan: ${formData.plan}` : ''}
${formData.learningGoal ? `Learning Goal: ${formData.learningGoal}` : ''}

📅 *Schedule Preferences:*
Days: ${formData.preferredDays?.join(", ") || "Not specified"}
Time: ${formData.preferredTime}

💬 I would like to book a FREE trial class for my child.
`.trim()

  const encodedMessage = encodeURIComponent(whatsappMessage)
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
  
  return url
}

// Redirect to WhatsApp with a small delay for UX
export function redirectToWhatsApp(url: string, delay: number = 1500) {
  setTimeout(() => {
    window.open(url, "_blank", "noopener,noreferrer")
  }, delay)
}
