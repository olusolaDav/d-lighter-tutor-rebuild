import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export const metadata: Metadata = {
  title: "Tutor Dashboard | D-lighter Tutor",
  robots: { index: false, follow: false },
}

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
