"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RecruiterDashboard() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("hiremate_userId");
    if (id) {
      setUserId(id);
    } else {
      toast({
        title: "User ID not found",
        description: "Please log in again.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchJobs(userId);
    }
  }, [userId]);

  const fetchJobs = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/employer/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      setJobs(data);
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (jobId: number, hasApplicants: boolean) => {
    const endpoint = hasApplicants
      ? `${API_BASE_URL}/api/jobs/delete/force/${jobId}`
      : `${API_BASE_URL}/api/jobs/delete/${jobId}`;

    const confirmed = window.confirm(
      hasApplicants
        ? "This job has applicants. Do you really want to force delete it?"
        : "Are you sure you want to delete this job?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete job");

      toast({
        title: "Job deleted",
        description: `Job ID ${jobId} has been deleted.`,
      });
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete job",
        variant: "destructive",
      });
    }
  };

  const handleResumeDownload = (filename: string) => {
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/uploads/resumes/${filename}`;
    link.download = filename;
    link.click();
  };

  const updateStatus = async (applicationId: number, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status?status=${status}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: `Application ${status.toLowerCase()}`,
        description: `Marked application as ${status}`,
      });

      fetchJobs(userId!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        </div>
        <Link href="/recruiter-dashboard/post-job">
          <Button>Post a New Job</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-4">You haven’t posted any jobs yet</p>
          <Link href="/recruiter-dashboard/post-job">
            <Button className="mx-auto">🚀 Post a New Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="card-hover">
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

                <div className="flex gap-4 mb-4">
                  <Button
                    onClick={() => router.push(`/recruiter-dashboard/edit-job/${job.id}`)}
                    variant="default"
                  >
                    Edit Job
                  </Button>
                  <Button
                    onClick={() => deleteJob(job.id, job.applicants?.length > 0)}
                    variant="destructive"
                  >
                    Delete Job
                  </Button>
                </div>

                <div className="mt-2">
                  <strong>{job.applicants?.length ?? 0}</strong> applicants
                  <ul className="text-sm text-muted-foreground mt-1 space-y-2">
                    {(job.applicants?.length ?? 0) === 0 ? (
                      <li>No applicants yet</li>
                    ) : (
                      job.applicants.map((a: any, i: number) => (
                        <li
                          key={i}
                          className={`flex flex-col gap-1 border-t pt-2 ${
                            a.status === "ACCEPTED"
                              ? "bg-green-50"
                              : a.status === "REJECTED"
                              ? "bg-red-50"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>
                              {a.name} ({a.email}) <span className="ml-2">({a.status})</span>
                            </span>
                            {a.resumeFilename && (
                              <Button
                                variant="link"
                                onClick={() =>
                                  window.open(`${API_BASE_URL}/uploads/resumes/${a.resumeFilename}`, "_blank")
                                }
                                className="text-sm"
                              >
                                View Resume
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(a.applicationId, "ACCEPTED")}
                              disabled={a.status === "ACCEPTED"}
                            >
                              ✅ Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(a.applicationId, "REJECTED")}
                              disabled={a.status === "REJECTED"}
                            >
                              ❌ Reject
                            </Button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
