"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/lib/auth-service"

interface Job {
  id: number
  title: string
  company: string
  location: string
  description: string
  salary?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function JobSeekerDashboard() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set())
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchJobs = async (search?: string) => {
    setIsLoading(true)
    try {
      const endpoint = search
        ? `${API_BASE_URL}/api/jobs/search?title=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/api/jobs/all`

      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch jobs")
      const data = await res.json()
      setJobs(data)
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(query)
  }

  const openUploadDialog = (jobId: number) => {
    setSelectedJobId(jobId)
    setShowUploadDialog(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setResumeFile(file)
  }

  const handleFileSubmit = async () => {
    const userId = localStorage.getItem("hiremate_userId")
    if (!userId || !selectedJobId || !resumeFile) return

    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("jobId", String(selectedJobId))
    formData.append("resume", resumeFile)

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Application failed")
      }

      toast({
        title: "Application submitted",
        description: `Resume submitted for job ID: ${selectedJobId}`,
      })

      setAppliedJobs((prev) => new Set(prev).add(selectedJobId))
      setShowUploadDialog(false)
      setResumeFile(null)
      fileInputRef.current?.value && (fileInputRef.current.value = "")
    } catch (error: any) {
      toast({
        title: "Apply failed",
        description: error.message || "Could not apply for job",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
        <Button onClick={() => window.location.href = "/jobseeker-dashboard/applications"}>
          View My Applications
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-2 top-2.5">🔎</span>
          <Input
            placeholder="Search job title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                  {job.company} — 📍 {job.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                  {job.description}
                </p>
                {job.salary && (
                  <p className="text-sm font-medium mb-4">
                    💰 <span className="text-primary">{job.salary}</span>
                  </p>
                )}
                <Button
                  className="w-full"
                  onClick={() => openUploadDialog(job.id)}
                  disabled={appliedJobs.has(job.id)}
                  variant={appliedJobs.has(job.id) ? "secondary" : "default"}
                >
                  {appliedJobs.has(job.id) ? "Already Applied" : "Apply"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Resume Modal */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button
              className="w-full"
              onClick={handleFileSubmit}
              disabled={!resumeFile}
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
