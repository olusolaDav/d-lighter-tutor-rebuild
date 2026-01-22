import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service | D-lighter Tutor",
  description: "Terms of Service for D-lighter Tutor - Our terms and conditions for using our tutoring services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          <p className="text-primary-foreground/80 mt-2">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the D-lighter Tutor website and services, you agree to be bound by these 
              Terms of Service (&quot;Terms&quot;) and our Privacy Policy. If you disagree with any part of these terms, 
              then you may not access or use our services. These Terms apply to all visitors, users, and others 
              who access or use our tutoring services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              D-lighter Tutor provides online tutoring services for Nigerian and African children aged 3-16. 
              Our services include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>One-on-one tutoring sessions via video conferencing</li>
              <li>Subject instruction in Mathematics, English, Science, African Languages, Coding, and Music</li>
              <li>Curriculum support for British, American, and Nigerian educational systems</li>
              <li>Homework assistance and exam preparation</li>
              <li>Progress tracking and regular feedback</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Registration and Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Be at least 18 years old or have parental consent</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security and confidentiality of your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our payment terms are as follows:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Free Trial:</strong> First session is complimentary for new students</li>
              <li><strong>Payment Methods:</strong> We accept bank transfers, card payments, and other approved methods</li>
              <li><strong>Billing Cycle:</strong> Sessions are typically paid per session or in packages</li>
              <li><strong>Currency:</strong> Payments accepted in GBP, USD, or local currencies</li>
              <li><strong>Refunds:</strong> Refund policy applies as outlined in Section 8</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Scheduling and Cancellation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Session Scheduling</h3>
                <p className="text-muted-foreground">
                  Sessions are scheduled based on mutual availability between tutors and students. 
                  We strive to accommodate preferred time slots across different time zones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cancellation Policy</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Students may cancel sessions with at least 24 hours notice</li>
                  <li>Cancellations with less than 24 hours notice may incur charges</li>
                  <li>Emergency cancellations will be considered on a case-by-case basis</li>
                  <li>Rescheduling is allowed subject to tutor availability</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Code of Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All users must adhere to our code of conduct:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Treat tutors and staff with respect and courtesy</li>
              <li>Arrive on time for scheduled sessions</li>
              <li>Come prepared with necessary materials</li>
              <li>Maintain appropriate behavior during sessions</li>
              <li>Report any concerns or issues promptly</li>
              <li>Not share login credentials or session access with unauthorized persons</li>
              <li>Not record sessions without explicit consent from all parties</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, materials, and resources provided during tutoring sessions remain the intellectual 
              property of D-lighter Tutor and our tutors. Students may use materials for personal study purposes 
              only. Redistribution, copying, or commercial use of our content is prohibited without written 
              permission. Any original work created by students during sessions remains their property.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Refund and Satisfaction Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Satisfaction Guarantee</h3>
                <p className="text-muted-foreground">
                  If you&apos;re not satisfied with a session, please contact us within 48 hours. 
                  We&apos;ll work to resolve the issue, which may include a replacement session or refund.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Refund Conditions</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Technical issues preventing session completion</li>
                  <li>Tutor unavailability without adequate notice</li>
                  <li>Service quality issues not resolved through remedial action</li>
                  <li>Unused sessions in prepaid packages (pro-rated)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              D-lighter Tutor provides tutoring services on an &quot;as is&quot; basis. While we strive for excellence, 
              we cannot guarantee specific academic outcomes. Our liability is limited to the amount paid for 
              the specific service in question. We are not liable for indirect, incidental, special, 
              consequential, or punitive damages arising from the use of our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Privacy and Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Our collection, use, and protection of personal information 
              is governed by our Privacy Policy, which is incorporated into these Terms by reference. 
              By using our services, you consent to our data practices as described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Either party may terminate the tutoring relationship:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>With reasonable notice for any reason</li>
              <li>Immediately for breach of these Terms</li>
              <li>For inappropriate conduct or behavior</li>
              <li>For non-payment of fees</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Upon termination, any unused prepaid sessions will be refunded on a pro-rated basis.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of Nigeria and the United Kingdom, depending on the 
              jurisdiction of service delivery. Any disputes will be resolved through arbitration or 
              in the courts of the applicable jurisdiction.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be posted on our website 
              and will become effective immediately upon posting. Your continued use of our services after 
              changes are posted constitutes acceptance of the modified Terms. We encourage you to review 
              these Terms periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-foreground font-semibold">D-lighter Tutor</p>
              <p className="text-muted-foreground mt-2">
                Email: <a href="mailto:info@d-lightertutor.com" className="text-secondary hover:underline">info@d-lightertutor.com</a>
              </p>
              <p className="text-muted-foreground">
                WhatsApp: <a href="https://wa.me/2348129517392" className="text-secondary hover:underline">+234 812 951 7392</a>
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm text-center">
              By using our services, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link href="/" className="text-secondary hover:underline font-medium">
            Return to D-lighter Tutor Home
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            © {new Date().getFullYear()} D-lighter Tutor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}