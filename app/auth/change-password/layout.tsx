// Standalone layout — no AuthPageGuard (this route must be accessible to logged-in users who mustChangePassword)
export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
