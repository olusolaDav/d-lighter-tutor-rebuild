import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy | D-lighter Tutor",
  description: "Privacy Policy for D-lighter Tutor - How we collect, use, and protect your information.",
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-primary-foreground/80 mt-2">Last updated: January 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              D-lighter Tutor (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and security of our users. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
              our website or use our tutoring services. Please read this policy carefully to understand our practices 
              regarding your personal data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and country of residence</li>
              <li><strong>Student Information:</strong> Student&apos;s age, grade level, subjects required, and preferred curriculum</li>
              <li><strong>Scheduling Preferences:</strong> Preferred days and times for tutoring sessions</li>
              <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send to us</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage data collected through cookies</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide, maintain, and improve our tutoring services</li>
              <li>To match students with appropriate tutors based on their needs</li>
              <li>To communicate with you about our services, including scheduling and updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send promotional materials and newsletters (with your consent)</li>
              <li>To analyze usage patterns and improve our website and services</li>
              <li>To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>With Tutors:</strong> We share relevant student information with assigned tutors to facilitate tutoring sessions</li>
              <li><strong>Service Providers:</strong> We may share data with third-party vendors who help us operate our business (e.g., payment processors, communication tools)</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
              Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to 
              protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
              Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need 
              your data, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are designed for children under parental supervision. We collect student information only 
              through parents or guardians who provide consent on behalf of their children. We do not knowingly collect 
              personal information directly from children under 13 without parental consent. If we learn that we have 
              collected personal information from a child without parental consent, we will take steps to delete that 
              information promptly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are 
              small data files stored on your device that help us remember your preferences and understand how you use 
              our site. You can control cookie settings through your browser preferences. Disabling cookies may affect 
              some features of our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have data protection laws that are different from the laws of your country. We take 
              appropriate safeguards to ensure that your personal data remains protected in accordance with this 
              Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
              new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this 
              policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-foreground font-semibold">D-lighter Tutor</p>
              <p className="text-muted-foreground mt-2">
                Email: <a href="mailto:info@dlightertutor.com" className="text-secondary hover:underline">info@dlightertutor.com</a>
              </p>
              <p className="text-muted-foreground">
                WhatsApp: <a href="https://wa.me/2348012345678" className="text-secondary hover:underline">+234 801 234 5678</a>
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm text-center">
              By using our website or services, you acknowledge that you have read, understood, and agree to be bound 
              by this Privacy Policy.
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
