"use client"

import { MessageCircle, Headphones, ArrowRight } from "lucide-react"

export function HelpCentreSection() {
  const openChat = () => {
    window.dispatchEvent(new CustomEvent("dlighter-open-chat"))
  }

  return (
    <section className="py-8 bg-secondary">
      <div className="container mx-auto px-4">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto rounded-xl px-6 py-5"
          style={{ background: "oklch(0.16 0.03 250)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Need help? We're always here for you.</p>
              <p className="text-xs text-white/65 mt-0.5">Chat with our AI assistant or connect with a real human agent.</p>
            </div>
          </div>
          <button
            onClick={openChat}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer bg-amber-400 hover:bg-amber-300 text-gray-900 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            Open Live Chat
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
