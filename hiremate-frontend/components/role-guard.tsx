"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface RoleGuardProps {
  role: string
  children: React.ReactNode
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("hiremate_role")

    if (!userRole) {
      router.push("/login")
    } else if (userRole !== role) {
      router.push("/unauthorized") // ❌ Redirect to an error or home page if role doesn't match
    }
  }, [role, router])

  return <>{children}</>
}
