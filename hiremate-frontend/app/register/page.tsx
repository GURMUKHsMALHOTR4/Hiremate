"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import BackButton from "@/components/common/BackButton"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })

  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formValid, setFormValid] = useState(false)

  const usernameRegex = /^(?=.*[_.])[a-zA-Z0-9_.]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  useEffect(() => {
    const usernameValid = usernameRegex.test(formData.username)
    const passwordValid = passwordRegex.test(formData.password)
    const passwordsMatch = formData.password === formData.confirmPassword
    const hasRole = !!formData.role
    const emailFilled = formData.email.length > 0
    setFormValid(usernameValid && passwordValid && passwordsMatch && hasRole && emailFilled)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "username") {
      if (value.length > 0 && !usernameRegex.test(value)) {
        setUsernameError("Username must contain at least one underscore (_) or period (.) and only valid characters")
      } else {
        setUsernameError("")
      }
    }

    if (name === "password") {
      if (value.length > 0 && !passwordRegex.test(value)) {
        setPasswordError("Password must include uppercase, lowercase, number, special character, min 8 chars")
      } else {
        setPasswordError("")
      }
    }
  }

  const validateForm = () => {
    if (!usernameRegex.test(formData.username)) {
      setUsernameError("Username must contain at least one underscore (_) or period (.) and only valid characters")
      return false
    }
    if (!passwordRegex.test(formData.password)) {
      setPasswordError("Password must include uppercase, lowercase, number, special character, min 8 chars")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!formData.role) {
      toast({
        title: "Select Role",
        description: "Please select whether you're a Job Seeker or Recruiter.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) return

    try {
      setIsLoading(true)

      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok) {
        if (data.message?.toLowerCase().includes("email")) {
          toast({
            title: "Email already registered",
            description: data.message,
            variant: "destructive",
          })
        } else if (data.message?.toLowerCase().includes("username")) {
          toast({
            title: "Username taken",
            description: data.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Registration failed",
            description: data.message || "There was a problem creating your account.",
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-pattern flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in">
          <BackButton />
          <Card className="relative border-border/50 mt-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Enter your information to get started with Hiremate</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} autoComplete="on">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    placeholder="e.g., john_doe or john.doe"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-card border-border/50 focus:border-primary"
                  />
                  {formData.username && (
                    <p className={`text-xs ${usernameError ? "text-red-500" : "text-green-600"}`}>
                      {usernameError || "Username looks good!"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-card border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-card border-border/50 focus:border-primary pr-10"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-sm cursor-pointer text-muted-foreground"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </span>
                  </div>
                  {formData.password && (
                    <p className={`text-xs ${passwordError ? "text-red-500" : "text-green-600"}`}>
                      {passwordError || "Strong password!"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-card border-border/50 focus:border-primary pr-10"
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-sm cursor-pointer text-muted-foreground"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                      <SelectItem value="Recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading || !formValid}>
                  {isLoading ? "Creating..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
