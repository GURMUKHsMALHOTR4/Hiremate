"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth, getToken } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [applied, setApplied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // ✅ Always update userId on mount
  useEffect(() => {
    const storedId = localStorage.getItem("hiremate_userId")
    if (!storedId) {
      toast({
        title: "Not Logged In",
        description: "Please login to apply for jobs.",
        variant: "destructive",
      })
      router.push("/login")
    } else {
      setUserId(storedId)
    }
  }, [router, toast])

  useEffect(() => {
    if (!userId) return

    const fetchJob = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:8080/api/jobs/${id}`)
        if (!res.ok) throw new Error("Failed to fetch job")
        const data = await res.json()
        setJob(data)

        // ✅ Only get jobIds for PENDING or ACCEPTED apps (backend handles it now)
        const checkRes = await fetchWithAuth(`http://localhost:8080/api/applications/jobIdsByUser`)
        const jobIds = await checkRes.json()
        if (Array.isArray(jobIds) && jobIds.includes(Number(id))) {
          setApplied(true)
        } else {
          setApplied(false)
        }
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
  }, [id, userId, toast])

  const handleApply = async () => {
    const token = getToken()
    if (!userId || !token) {
      toast({
        title: "Unauthorized",
        description: "Please login first.",
        variant: "destructive",
      })
      return
    }

    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume before applying.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("jobId", String(id)) // ✅ Do NOT send userId
    formData.append("resume", resumeFile)

    try {
      const res = await fetch("http://localhost:8080/api/applications/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to apply")
      }

      toast({
        title: "Success",
        description: "Application submitted!",
      })
      setApplied(true)
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

      {applied ? (
        <Button disabled className="w-full">
          ✅ Already Applied
        </Button>
      ) : (
        <div className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleApply} className="w-full">
            Apply Now
          </Button>
        </div>
      )}
    </div>
  )
}
