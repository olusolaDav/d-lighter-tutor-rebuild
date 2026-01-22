import type { Metadata } from "next"

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      {/* Background decoration matching main site */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] h-24 w-24 rounded-full bg-secondary/20 blur-xl animate-pulse" />
        <div className="absolute top-40 right-[15%] h-32 w-32 rounded-full bg-accent/20 blur-xl animate-pulse" style={{animationDelay: "1s"}} />
        <div className="absolute bottom-32 left-[20%] h-20 w-20 rounded-full bg-secondary/15 blur-lg animate-pulse" style={{animationDelay: "0.5s"}} />
      </div>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              D-lighter Tutor
            </h1>
            <p className="text-lg text-primary-foreground/90">Admin Portal</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}