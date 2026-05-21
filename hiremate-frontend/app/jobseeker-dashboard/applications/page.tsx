"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/lib/auth-service"
import BackButton from "@/components/common/BackButton"
import { Button } from "@/components/ui/button"

interface Job {
  id: number
  title: string
  company: string
  location: string
}

interface Application {
  applicationId: number
  jobId: number
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  resumeFilename?: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hiremate-backend-zaoc.onrender.com"

export default function JobSeekerApplicationsPage() {

  const { toast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Record<number, Job>>({})
  const [isLoading, setIsLoading] = useState(true)

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("hiremate_userId")
      : null

  const fetchApplications = async () => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/api/applications/byUser/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Failed to fetch applications")
      }

      const data: Application[] = await res.json()

      console.log("Applications:", data)

      setApplications(data)

      const jobIds = data.map((a) => a.jobId)

      const jobFetches = jobIds.map((id) =>
        fetch(`${API_BASE_URL}/api/jobs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }).then((r) => r.json())
      )

      const jobResults = await Promise.all(jobFetches)

      const jobMap: Record<number, Job> = {}

      jobResults.forEach((job: Job) => {
        jobMap[job.id] = job
      })

      setJobs(jobMap)

    } catch (err: any) {

      toast({
        title: "Error",
        description: err.message || "Unable to fetch applications",
        variant: "destructive",
      })

    } finally {

      setIsLoading(false)

    }
  }

  useEffect(() => {

    if (userId) {
      fetchApplications()
    }

  }, [userId])

  const handleDownload = (filename: string) => {

    const fileUrl =
      `${API_BASE_URL}/uploads/resumes/${filename}`

    window.open(fileUrl, "_blank")

  }

  const handleWithdraw = async (applicationId: number) => {

    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    )

    if (!confirmed) return

    try {

      console.log("Withdrawing:", applicationId)

      const res = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/cancel`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )

      if (!res.ok) {

        const text = await res.text()

        console.log(text)

        throw new Error("Withdraw failed")

      }

      toast({
        title: "Withdrawn",
        description: "Application withdrawn successfully.",
      })

      setApplications((prev) =>
        prev.filter(
          (a) => a.applicationId !== applicationId
        )
      )

    } catch (error: any) {

      toast({
        title: "Error",
        description:
          error.message || "Failed to withdraw application",
        variant: "destructive",
      })

    }
  }

  return (

    <div className="min-h-screen p-8 max-w-5xl mx-auto">

      <BackButton />

      <h1 className="text-3xl font-bold mb-6">
        My Applications
      </h1>

      {isLoading ? (

        <p className="text-muted-foreground">
          Loading applications...
        </p>

      ) : applications.length === 0 ? (

        <p className="text-muted-foreground">
          You haven't applied to any jobs yet.
        </p>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {applications.map((app) => {

            const job = jobs[app.jobId]

            return (

              <Card key={app.applicationId}>

                <CardHeader>

                  <CardTitle>
                    {job?.title || "Job Title"}
                  </CardTitle>

                  <CardDescription>
                    {job?.company} — 📍 {job?.location}
                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <p className="text-sm mb-1">

                    Status:{" "}

                    <span
                      className={
                        app.status === "ACCEPTED"
                          ? "text-green-600"
                          : app.status === "REJECTED"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }
                    >
                      {app.status}
                    </span>

                  </p>

                  {app.resumeFilename && (

                    <Button
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() =>
                        handleDownload(app.resumeFilename!)
                      }
                    >
                      View Resume
                    </Button>

                  )}

                  <div className="mt-3 flex justify-between items-center">

                    <p className="text-xs text-muted-foreground">

                      Application ID: {app.applicationId}

                    </p>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleWithdraw(app.applicationId)
                      }
                      disabled={app.status !== "PENDING"}
                    >
                      Withdraw
                    </Button>

                  </div>

                </CardContent>

              </Card>

            )

          })}

        </div>

      )}

    </div>
  )
}