"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth, getAuthHeader } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface Job {
  id: number
  title: string
  description: string
  location: string
  company: string
  salary: string
}

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:8080/api/jobs/${id}`)
        if (!res.ok) throw new Error("Failed to fetch job")
        const data = await res.json()
        setJob(data)
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Could not load job.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [id, toast])

  const handleApply = async () => {
    const userId = localStorage.getItem("hiremate_userId")
    if (!userId) {
      toast({
        title: "Login required",
        description: "Please login to apply for this job.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const res = await fetch("http://localhost:8080/api/applications/apply", {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
          jobId: Number(id),
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to apply")
      }

      toast({
        title: "Success",
        description: "You have successfully applied for the job!",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Application failed.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return <div className="p-6 text-center">Job not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
      <p className="text-muted-foreground mb-4">{job.company}</p>
      <p className="mb-2">📍 {job.location}</p>
      <p className="mb-2">💰 {job.salary}</p>
      <p className="mb-6 whitespace-pre-line">{job.description}</p>

      <Button onClick={handleApply} className="w-full">
        Apply Now
      </Button>
    </div>
  )
}
