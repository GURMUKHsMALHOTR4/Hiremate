"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"

export default function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  )
}
