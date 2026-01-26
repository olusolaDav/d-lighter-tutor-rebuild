"use client"

import { Button } from "@/components/ui/button"
import { generateWhatsAppUrl } from "@/lib/utils"

const testFormData = {
  name: "John Test",
  email: "john@test.com",
  phone: "+1234567890",
  studentAge: "10",
  subjects: ["Mathematics", "English"],
  gradeLevel: "Year 5",
  country: "United Kingdom",
  otherCountry: "",
  preferredDays: ["Monday", "Wednesday"],
  preferredTime: "4:00 PM - 5:00 PM",
  curriculum: "British Curriculum",
  learningGoal: "Improve math skills",
  plan: "Standard"
}

export function TestWhatsApp() {
  const handleTest = () => {
    console.log("🧪 Testing WhatsApp redirect...")
    
    try {
      const url = generateWhatsAppUrl(testFormData, "test-page")
      console.log("🔗 Test URL:", url)
      
      const newWindow = window.open(url, "_blank", "noopener,noreferrer")
      
      if (newWindow) {
        console.log("✅ Test window opened successfully!")
      } else {
        console.log("❌ Test window was blocked")
      }
    } catch (error) {
      console.error("❌ Test error:", error)
    }
  }

  return (
    <Button onClick={handleTest} variant="outline" className="fixed bottom-4 right-4 z-50">
      🧪 Test WhatsApp
    </Button>
  )
}