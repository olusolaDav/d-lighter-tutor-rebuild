import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Job Posting Guidelines | Alot Digital Agency",
  description: "Review the job posting guidelines and policies for listing career opportunities on the Alot Digital Agency talent hub.",
  robots: "noindex",
};

export default function JobPostingPoliciesPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Job Posting Guidelines</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Eligibility</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Job postings may be submitted by verified employers, hiring managers, or authorized representatives of
              legitimate organisations. By posting a job, you confirm that you have the authority to recruit on
              behalf of the organisation listed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Accurate Information</h2>
            <p className="text-gray-600 dark:text-gray-300">
              All job listings must contain truthful, accurate, and up-to-date information including job title,
              responsibilities, required qualifications, location, and compensation. Misleading or fraudulent
              postings will be removed immediately and the account may be suspended.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Prohibited Content</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
              <li>Postings that discriminate based on race, gender, religion, nationality, disability, or any protected characteristic</li>
              <li>Listings that require upfront payment from applicants</li>
              <li>Multi-level marketing (MLM) or pyramid scheme opportunities</li>
              <li>Fake, scam, or placeholder job listings</li>
              <li>Adult, illegal, or otherwise inappropriate content</li>
              <li>Duplicate listings for the same position</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">4. Approval Process</h2>
            <p className="text-gray-600 dark:text-gray-300">
              All submitted job postings are reviewed by our team before being published on the public careers
              page. We reserve the right to approve, reject, or request edits to any listing. You will be notified
              via email once a decision is made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">5. Applicant Data</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Applicant information collected through our platform must only be used for recruitment purposes
              related to the posted role. Sharing, selling, or misusing applicant data is strictly prohibited
              and may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">6. Removal of Listings</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Job postings should be taken down once the position is filled. Listings that remain active for
              positions that are no longer available may be removed by our moderation team. Employers can
              unpublish their listings at any time from their dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">7. Compliance with Laws</h2>
            <p className="text-gray-600 dark:text-gray-300">
              All job listings must comply with applicable employment laws in Nigeria and internationally,
              including but not limited to anti-discrimination laws, minimum wage regulations, and data
              protection requirements under the Nigeria Data Protection Act (NDPA) and GDPR where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">8. Policy Updates</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Alot Digital Agency reserves the right to update these policies at any time. Continued use of
              our job posting features constitutes acceptance of the updated policies.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Questions? Contact us at{" "}
              <a
                href="mailto:admin@alotdigitalagency.com"
                className="text-brand-600 hover:underline"
              >
                admin@alotdigitalagency.com
              </a>
            </p>
            <Link
              href="/careers"
              className="inline-block mt-4 text-brand-600 hover:underline text-sm"
            >
              ← Back to Careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
