import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export const metadata: Metadata = {
  title: "Student Dashboard | D-lighter Tutor",
  robots: { index: false, follow: false },
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
