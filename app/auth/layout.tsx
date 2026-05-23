import type { Metadata } from "next"
import { AuthPageGuard } from "./auth-page-guard"

export const metadata: Metadata = {
  title: "Sign In | D-lighter Tutor",
  description: "Sign in to your D-lighter Tutor account",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthPageGuard>{children}</AuthPageGuard>
}
