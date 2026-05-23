import type { Metadata } from "next"
import { AuthPageGuard } from "./auth-page-guard"

export const metadata: Metadata = {
  title: "Admin Authentication | D-lighter Tutor",
  description: "Secure admin portal access for D-lighter Tutor team members",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthPageGuard>{children}</AuthPageGuard>
}