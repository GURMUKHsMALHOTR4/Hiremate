"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/lib/auth-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Job {
  id: number
  title: string
  description: string
  location: string
  company: string
  salary: string
}

export default function JobListingsPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([])

  const fetchJobs = async (query?: string) => {
    try {
      setIsLoading(true)
      const endpoint = query
        ? `http://localhost:8080/jobs/search?title=${encodeURIComponent(query)}`
        : "http://localhost:8080/jobs/all"

      const res = await fetchWithAuth(endpoint)
      if (!res.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await res.json()
      setJobs(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not load jobs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAppliedJobIds = async (userId: number) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/api/applications/jobIdsByUser/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch applied job IDs")
      const ids = await res.json()
      setAppliedJobIds(ids)
    } catch (err: any) {
      console.error("Error fetching applied jobs:", err.message)
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      fetchAppliedJobIds(Number(userId))
    }
    fetchJobs()
  }, [])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    fetchJobs(searchTerm)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      {/* 🔍 Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search by job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="text-center mt-10">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading jobs...</h2>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const alreadyApplied = appliedJobIds.includes(job.id)
            return (
              <Card key={job.id} className="border border-border/50 shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                  <p className="text-sm">📍 {job.location}</p>
                  <p className="text-sm">💰 {job.salary}</p>
                  <Button asChild className="w-full mt-3" disabled={alreadyApplied}>
                    <Link href={`/job/${job.id}`}>
                      {alreadyApplied ? "Already Applied" : "View Details"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
