 "use client"

import { useEffect, useState } from "react"
import BackButton from "@/components/common/BackButton"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/lib/auth-service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function EditJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    salary: "",
  })

  useEffect(() => {
    if (!id) return
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        })

        if (!res.ok) throw new Error("Failed to load job")

        const job = await res.json()
        setFormData({
          title: job.title,
          description: job.description,
          location: job.location,
          company: job.company,
          salary: job.salary,
        })
      } catch (error: any) {
        toast({
          title: "Error loading job",
          description: error.message || "Something went wrong",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update job")

      toast({
        title: "Job updated",
        description: "The job has been successfully updated.",
      })

      router.push("/recruiter-dashboard")
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading job details...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Update Job
          </Button>
        </form>
      )}
    </div>
  )
}
