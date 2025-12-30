import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
           <Image src="/images/brand-logo.svg" alt="D-lighter Tutor Logo" width={32} height={32} />
            <span className="text-xl font-bold text-foreground">D-lighter Tutor</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#subjects" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
            Subjects
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
          >
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
            FAQ
          </Link>
          {/* <Link href="#blog" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">
            Blog
          </Link> */}
          <Link
            href="#become-tutor"
            className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
          >
            Become a Tutor
          </Link>
        </nav>

        {/* Mobile menu (hamburger) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary/10"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 p-4">
                <Link href="#subjects" className="text-base font-medium text-foreground">
                  Subjects
                </Link>
                <Link href="#how-it-works" className="text-base font-medium text-foreground">
                  How It Works
                </Link>
                <Link href="#pricing" className="text-base font-medium text-foreground">
                  Pricing
                </Link>
                <Link href="#faq" className="text-base font-medium text-foreground">
                  FAQ
                </Link>
                <Link href="#become-tutor" className="text-base font-medium text-foreground">
                  Become a Tutor
                </Link>
              </nav>
              <SheetFooter>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <a
                      href="https://wa.me/2348129517392"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <a
              href="https://wa.me/2348129517392"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat on WhatsApp</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
