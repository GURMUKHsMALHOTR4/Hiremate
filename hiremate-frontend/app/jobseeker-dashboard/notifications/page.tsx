"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"

interface Notification {
  jobTitle: string
  company: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const userId = localStorage.getItem("hiremate_userId")
    if (!userId) return

    fetch(`${API_BASE_URL}/api/applications/byUser/${userId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const transformed = data.map((app: any) => ({
          jobTitle: app.jobTitle || "Unknown Role",
          company: app.company || "Unknown Company",
          status: app.status,
        }))
        setNotifications(transformed.reverse()) // Latest first
      })
      .catch(console.error)
  }, [])

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "✅"
      case "REJECTED":
        return "❌"
      default:
        return "⏳"
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          ← Back
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-white">🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground text-lg">🔕 No notifications</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((note, index) => {
            const bg =
              note.status === "ACCEPTED"
                ? "bg-green-800"
                : note.status === "REJECTED"
                ? "bg-red-800"
                : "bg-slate-700"

            return (
              <li
                key={index}
                className={`${bg} p-4 rounded-md text-white border border-gray-600`}
              >
                <p className="font-semibold text-lg">💼 {note.jobTitle}</p>
                <p className="text-sm text-gray-300">🏢 {note.company}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {getStatusEmoji(note.status)} Status:{" "}
                  <span className="font-medium">{note.status}</span>
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
