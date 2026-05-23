// This route bypasses the AuthPageGuard — it's accessible to unauthenticated users
// and is protected by a secret key instead.
export default function RegisterSuperAdminsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
