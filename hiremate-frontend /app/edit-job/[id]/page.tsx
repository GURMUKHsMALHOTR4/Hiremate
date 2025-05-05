"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeader } from "@/lib/auth-service"

export default function EditJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()

  const jobId = params?.id as string
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    salary: "",
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!jobId) return

    console.log("Editing Job ID:", jobId)

    fetch(`http://localhost:8080/api/jobs/${jobId}`, {
      method: "GET",
      headers: getAuthHeader(),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job details")
        return res.json()
      })
      .then((data) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          company: data.company || "",
          salary: data.salary || "",
        })
      })
      .catch((err) => {
        console.error(err)
        toast({
          title: "Error",
          description: err.message || "Could not load job data",
          variant: "destructive",
        })
      })
      .finally(() => setIsLoading(false))
  }, [jobId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`http://localhost:8080/api/jobs/update/${jobId}`, {
        method: "PUT",
        headers: {
          ...getAuthHeader(),
        },
        credentials: "include",
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Failed to update job")

      toast({ title: "Job Updated", description: "Job details updated successfully." })
      router.push("/dashboard")
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading job data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
        <Textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} required />
        <Input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
        <Input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
        <Input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} required />
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </div>
  )
}
