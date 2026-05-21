"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getToken, removeToken, getAuthHeader } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

interface Job {
  id: number
  title: string
  company: string
  location: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const token = getToken()
    const storedUsername = localStorage.getItem("hiremate_username")
    const storedUserId = localStorage.getItem("hiremate_userId")

    if (!token || !storedUserId) {
      toast({
        title: "Authentication required",
        description: "Please login to access the dashboard",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setUsername(storedUsername || "User")

    fetch(`${API_BASE_URL}/api/jobs/employer/${storedUserId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs")
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data)
        } else {
          throw new Error("Invalid jobs response format")
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err)
        toast({
          title: "Error loading jobs",
          description: err.message || "Unknown error",
          variant: "destructive",
        })
      })
      .finally(() => setIsLoading(false))
  }, [router, toast])

  const handleLogout = () => {
    removeToken()
    localStorage.removeItem("hiremate_username")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true" aria-live="polite">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading your dashboard</h2>
          <p className="text-muted-foreground">Please wait while we prepare your experience</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full">
                  <span className="font-bold text-white text-lg">H</span>
                </div>
              </div>
              <div className="font-bold text-2xl bg-gradient-to-r from-purple-400 via-primary to-blue-400 bg-clip-text text-transparent">
                Hiremate
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-sm">{username?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm hidden md:inline">{username}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-border/50 hover:bg-primary/10">
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="grid-pattern flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold">Welcome, {username}</h2>
              <p className="text-muted-foreground">Your personalized dashboard is below.</p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">You haven’t posted any jobs yet.</p>
                <Button onClick={() => router.push("/create-job")}>+ Post a New Job</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {jobs.map((job) => (
                    <Card key={job.id} className="bg-card shadow-md">
                      <CardHeader>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.company} — {job.location}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                        <div className="flex justify-between gap-2">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/edit-job/${job.id}`)}
                            className="w-full"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              const confirmDelete = window.confirm("Are you sure you want to delete this job?")
                              if (!confirmDelete) return
                              try {
                                const res = await fetch(`${API_BASE_URL}/api/jobs/delete/${job.id}`, {
                                  method: "DELETE",
                                  headers: getAuthHeader(), // ✅ Add JWT here
                                  credentials: "include",
                                })
                                if (!res.ok) throw new Error("Failed to delete job")
                                toast({ title: "Job Deleted", description: `Job ID ${job.id} removed.` })
                                setJobs((prev) => prev.filter((j) => j.id !== job.id))
                              } catch (err: any) {
                                console.error(err)
                                toast({ title: "Error", description: err.message, variant: "destructive" })
                              }
                            }}
                            className="w-full"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Job Button */}
                <div className="text-center mt-4">
                  <Button onClick={() => router.push("/create-job")}>+ Post a New Job</Button>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/30">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-muted-foreground">© 2025 Hiremate. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
