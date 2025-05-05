"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeader } from "@/lib/auth-service"

export default function PostJobPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    salary: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("hiremate_token")
      const employerId = localStorage.getItem("hiremate_userId")

      if (!token || !employerId) {
        toast({
          title: "Authentication required",
          description: "Please login to post a job.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const payload = {
        ...formData,
        employerId: Number(employerId),
      }

      const response = await fetch("http://localhost:8080/api/jobs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Required for backend auth
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = "Failed to post job"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (err) {
          const raw = await response.text()
          errorMessage = raw || errorMessage
        }

        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Job posted successfully!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Post Job Error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required />
          <Textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleChange} required />
          <Input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
          <Input name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} required />
          <Input name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Posting..." : "Post Job"}
          </Button>
        </form>
      </div>
    </div>
  )
}
