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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { Download, X, MessageSquare } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hiremate-backend-zaoc.onrender.com";

export default function RecruiterDashboard() {

  const [hasNewNotifications, setHasNewNotifications] =
    useState(false);

  const [hasNewMessages, setHasNewMessages] =
    useState(false);

  const { toast } = useToast();

  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [username, setUsername] =
    useState<string | null>(null);

  const [openJobId, setOpenJobId] =
    useState<number | null>(null);

  const [applicants, setApplicants] =
    useState<any[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const [jobIdsWithApplicants, setJobIdsWithApplicants] =
    useState<Set<number>>(new Set());

  const [showProfileDropdown, setShowProfileDropdown] =
    useState(false);

  const getInitial = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  useEffect(() => {

    const id =
      localStorage.getItem("hiremate_userId");

    const uname =
      localStorage.getItem("hiremate_username");

    if (id && uname) {

      setUserId(id);
      setUsername(uname);

    } else {

      toast({
        title: "Not logged in",
        description: "Please sign in again.",
        variant: "destructive",
      });

      router.push("/login");
    }

  }, []);

  useEffect(() => {

    if (!userId) return;

    setIsLoading(true);

    fetch(`${API_BASE_URL}/api/jobs/employer/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((r) => {
        if (!r.ok)
          throw new Error("Fetch failed: " + r.status);

        return r.json();
      })
      .then((data) => {
        setJobs(data);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      )
      .finally(() => setIsLoading(false));

  }, [userId, toast]);

  useEffect(() => {

    if (!userId) return;

    (async () => {

      try {

        const res = await fetch(
          `${API_BASE_URL}/api/jobs/employer/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const jobsData = await res.json();

        const activeJobIds: number[] = [];

        for (const job of jobsData) {

          const appRes = await fetch(
            `${API_BASE_URL}/api/applications/byJob/${job.id}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );

          const apps = await appRes.json();

          if (apps.length > 0) {
            activeJobIds.push(job.id);
          }
        }

        setJobIdsWithApplicants(
          new Set(activeJobIds)
        );

        setHasNewNotifications(
          activeJobIds.length > 0
        );

      } catch (e) {

        console.error(
          "Failed to fetch application highlights",
          e
        );
      }

    })();

  }, [userId]);

  const fetchApplicants = async (jobId: number) => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/api/applications/byJob/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok)
        throw new Error("Failed to fetch applicants");

      const data = await res.json();

      console.log("Applicants:", data);

      setApplicants(data);

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err.message || "Failed to load applicants",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async () => {

    if (!userId) return;

    try {

      const res = await fetch(
        `${API_BASE_URL}/api/jobs/employer/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const jobList = await res.json();

      const allNotifs: any[] = [];

      for (const job of jobList) {

        const appRes = await fetch(
          `${API_BASE_URL}/api/applications/byJob/${job.id}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!appRes.ok) continue;

        const applicants = await appRes.json();

        applicants.forEach((a: any) => {

          allNotifs.push({
            jobTitle: job.title,
            applicantUsername: a.username,
            applicantEmail: a.email,
            status: a.status,
          });

        });
      }

      setNotifications(allNotifs);

    } catch (err: any) {

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (jobId: number) => {

    setOpenJobId(jobId);

    fetchApplicants(jobId);

    setJobIdsWithApplicants((prev) => {

      const newSet = new Set(prev);

      newSet.delete(jobId);

      return newSet;
    });
  };

  const deleteJob = async (
    jobId: number,
    hasApplicants: boolean
  ) => {

    const endpoint = hasApplicants
      ? `${API_BASE_URL}/api/jobs/delete/force/${jobId}`
      : `${API_BASE_URL}/api/jobs/delete/${jobId}`;

    if (
      !confirm(
        hasApplicants
          ? "This job has applicants. Force delete?"
          : "Are you sure you want to delete this job?"
      )
    ) {
      return;
    }

    try {

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok)
        throw new Error("Delete failed");

      toast({
        title: "Deleted",
        description: `Job #${jobId} removed`,
      });

      setJobs((js) =>
        js.filter((j) => j.id !== jobId)
      );

    } catch (err: any) {

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (
    applicationId: number,
    jobId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok)
        throw new Error("Update failed");

      toast({
        title:
          status === "ACCEPTED"
            ? "Accepted"
            : "Rejected",

        description:
          `Application #${applicationId} ${status.toLowerCase()}`,
      });

      setApplicants((apps) =>
        apps.map((a: any) =>
          a.applicationId === applicationId
            ? { ...a, status }
            : a
        )
      );

    } catch (err: any) {

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (

    <div className="min-h-screen p-8 max-w-6xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-4">

          <BackButton />

          <h1 className="text-3xl font-bold">
            Recruiter Dashboard
          </h1>

        </div>

        <div className="flex items-center gap-2">

          <Button
            variant={
              hasNewNotifications
                ? "secondary"
                : "outline"
            }
            onClick={() => {
              setShowNotifications(true);
              fetchNotifications();
              setHasNewNotifications(false);
            }}
          >
            🔔 Notifications
          </Button>

          <Link href="/recruiter-dashboard/messages">
            <Button
              variant={
                hasNewMessages
                  ? "secondary"
                  : "outline"
              }
              size="icon"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </Link>

        </div>

      </div>

      {isLoading ? (

        <p>Loading jobs...</p>

      ) : (

        <div className="space-y-6">

          {jobs.map((job) => (

            <Card key={job.id}>

              <CardHeader
                className="cursor-pointer"
                onClick={() =>
                  handleOpenDialog(job.id)
                }
              >

                <CardTitle>
                  {job.title}
                </CardTitle>

                <CardDescription>
                  {job.company} — 📍 {job.location}
                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="flex gap-4 mb-2">

                  <Button
                    onClick={() =>
                      router.push(
                        `/recruiter-dashboard/edit-job/${job.id}`
                      )
                    }
                  >
                    Edit Job
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      deleteJob(job.id, true)
                    }
                  >
                    Delete Job
                  </Button>

                </div>

                <Dialog
                  open={openJobId === job.id}
                  onOpenChange={(o) =>
                    setOpenJobId(o ? job.id : null)
                  }
                >

                  <DialogContent className="max-w-lg">

                    <div className="flex justify-between items-center mb-4">

                      <DialogTitle>
                        Applicants for{" "}
                        <strong>{job.title}</strong>
                      </DialogTitle>

                      <button
                        onClick={() =>
                          setOpenJobId(null)
                        }
                      >
                        <X className="w-5 h-5" />
                      </button>

                    </div>

                    <ul className="space-y-4 text-sm">

                      {applicants.length ? (

                        applicants.map((a: any) => (

                          <li
                            key={a.applicationId}
                            className="border p-3 rounded"
                          >

                            <div className="flex justify-between items-center">

                              <span>
                                @{a.username} ({a.email})
                              </span>

                              {a.resumeFilename && (

                                <button
                                  onClick={() => {

                                    const url =
                                      `${API_BASE_URL}/uploads/resumes/${a.resumeFilename}`;

                                    window.open(
                                      url,
                                      "_blank"
                                    );
                                  }}
                                  className="hover:text-primary"
                                >
                                  <Download className="w-5 h-5" />
                                </button>

                              )}

                            </div>

                            <div className="mt-3 flex gap-3">

                              {a.status === "PENDING" && (

                                <>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateStatus(
                                        a.applicationId,
                                        job.id,
                                        "ACCEPTED"
                                      )
                                    }
                                  >
                                    ✅ Accept
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      updateStatus(
                                        a.applicationId,
                                        job.id,
                                        "REJECTED"
                                      )
                                    }
                                  >
                                    ❌ Reject
                                  </Button>

                                </>

                              )}

                              {a.status === "ACCEPTED" && (

                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {

                                    console.log(
                                      "Applicant:",
                                      a
                                    );

                                    if (
                                      !a.userId ||
                                      !a.username ||
                                      !userId ||
                                      !username
                                    ) {

                                      toast({
                                        title:
                                          "Missing Info",

                                        description:
                                          "User ID or Username missing.",

                                        variant:
                                          "destructive",
                                      });

                                      return;
                                    }

                                    router.push(
                                      `/recruiter-dashboard/messages?senderId=${userId}&senderUsername=${encodeURIComponent(username)}&receiverId=${a.userId}&receiverUsername=${encodeURIComponent(a.username)}`
                                    );
                                  }}
                                >
                                  💬 Message
                                </Button>

                              )}

                            </div>

                          </li>

                        ))

                      ) : (

                        <li>
                          No applicants yet.
                        </li>

                      )}

                    </ul>

                  </DialogContent>

                </Dialog>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}