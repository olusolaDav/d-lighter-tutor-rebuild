"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, Cookie, Settings, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = "dlighter-cookie-consent"
const COOKIE_PREFERENCES_KEY = "dlighter-cookie-preferences"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    saveConsent(allAccepted)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    saveConsent(necessaryOnly)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    setShowPreferences(false)

    // Trigger analytics based on consent
    if (prefs.analytics && typeof window !== "undefined") {
      // Enable Google Analytics
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
      })
    }

    if (prefs.marketing && typeof window !== "undefined") {
      // Enable marketing cookies
      window.gtag?.("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      })
    }
  }

  if (!showBanner) return null

  return (
    <>
      {/* Backdrop for preferences modal */}
      {showPreferences && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]" 
          onClick={() => setShowPreferences(false)}
        />
      )}

      {/* Cookie Consent Banner */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 transition-transform duration-500",
          showBanner ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 md:p-8">
            {!showPreferences ? (
              // Main Banner
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      We value your privacy 🍪
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                      By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can manage your preferences 
                      or learn more in our{" "}
                      <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Close cookie banner"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAcceptNecessary}
                    className="flex-1 sm:flex-none"
                  >
                    Necessary Only
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreferences(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Preferences
                  </Button>
                </div>
              </div>
            ) : (
              // Preferences Panel
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 pr-4">
                      <h4 className="font-medium text-foreground">Necessary Cookies</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Essential for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 pr-4">
                      <h4 className="font-medium text-foreground">Analytics Cookies</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help us understand how visitors interact with our website by collecting anonymous information.
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                      className={cn(
                        "w-12 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer",
                        preferences.analytics ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"
                      )}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 pr-4">
                      <h4 className="font-medium text-foreground">Marketing Cookies</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                      className={cn(
                        "w-12 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer",
                        preferences.marketing ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"
                      )}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={handleSavePreferences} className="flex-1">
                    Save Preferences
                  </Button>
                  <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
                    Accept All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Add type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, string>
    ) => void
    dataLayer?: unknown[]
  }
}
