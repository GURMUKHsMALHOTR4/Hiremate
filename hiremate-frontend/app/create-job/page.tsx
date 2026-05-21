"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeader } from "@/lib/auth-service"

export default function CreateJobPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    salary: "",
  })

  const [employerId, setEmployerId] = useState<number | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem("hiremate_userId")
    if (storedId) {
      setEmployerId(parseInt(storedId)) // ✅ convert string to number
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employerId) {
      toast({
        title: "Missing Employer ID",
        description: "You must be logged in to post a job.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("http://localhost:8080/api/jobs/create", {
        method: "POST",
        headers: getAuthHeader(), // ✅ uses token + content-type
        body: JSON.stringify({ ...form, employerId }),
      })

      if (!res.ok) throw new Error("Failed to post job")

      toast({ title: "Success", description: "Job posted successfully" })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
        <Textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} required />
        <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
        <Input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
        <Input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} required />
        <Button type="submit" className="w-full">Post Job</Button>
      </form>
    </div>
  )
}
