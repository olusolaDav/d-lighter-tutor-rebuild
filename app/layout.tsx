import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "D-lighter Tutor - Best Online Tutoring Platform for Nigerian Children in Diaspora",
  description:
    "Quality online tutoring for Nigerian and African children (ages 3-16) in UK, US & Canada. Expert tutors for Maths, English, Science, Nigerian languages (Igbo, Yoruba), and more. Flexible payment in Naira.",
  keywords: [
    "online tutoring",
    "Nigerian tutors",
    "African diaspora education",
    "Igbo lessons",
    "Yoruba lessons",
    "British curriculum",
    "American curriculum",
    "one-on-one tutoring",
  ],
  generator: "Powered by Alot Digital Agency",
  icons: {
    icon: [
      {
        url: "/brand-logo-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand-logo-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/brand-logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/brand-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-center" closeButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
