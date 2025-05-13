"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import BackButton from "@/components/common/BackButton"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Login failed",
          description: data?.message || "Invalid username or password.",
          variant: "destructive",
        })
        return
      }

      // Store login info
      localStorage.setItem("hiremate_token", data.token)
      localStorage.setItem("hiremate_userId", String(data.userId))
      localStorage.setItem("hiremate_username", data.username)
      localStorage.setItem("hiremate_role", data.role)

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Redirect based on role
      setTimeout(() => {
        const role = data.role?.toUpperCase().replace(/\s+/g, "_")
        if (role === "RECRUITER") {
          router.push("/recruiter-dashboard")
        } else if (role === "JOB_SEEKER") {
          router.push("/jobseeker-dashboard")
        } else {
          router.push("/dashboard")
        }
      }, 150)
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-pattern flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <BackButton />
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
          <Link href="/register">
            <Button className="relative overflow-hidden group">
              <span className="relative z-10">Register</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-30"></div>
            <Card className="relative border-border/50">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Login to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-card border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-card border-border/50 focus:border-primary"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <span className="relative z-10">
                      {isLoading ? "Logging in..." : "Login"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
