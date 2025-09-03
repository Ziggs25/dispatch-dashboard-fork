"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield } from "lucide-react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useAuthContext } from "@/auth/AuthProvider"

export const Route = createFileRoute('/login')({
  component: LoginScreen,
})

function LoginScreen() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' }) as { redirect?: string }
  const { signIn, signUp } = useAuthContext()

  const [isSignup, setIsSignup] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    badgeNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignup) {
        if (credentials.password !== credentials.confirmPassword) {
          setError("Passwords do not match")
          setIsLoading(false)
          return
        }
        const { error } = await signUp({
          email: credentials.email,
          password: credentials.password,
          first_name: credentials.firstName,
          middle_name: credentials.middleName,
          last_name: credentials.lastName,
          badgenumber: credentials.badgeNumber,
        })
        if (error) {
          setError(error)
          setIsLoading(false)
          return
        }
        setIsSignup(false)
        setIsLoading(false)
        return
      } else {
        const { error } = await signIn({ email: credentials.email, password: credentials.password })
        if (error) {
          setError(error)
          setIsLoading(false)
          return
        }
        const to = (search?.redirect && typeof search.redirect === 'string') ? search.redirect : '/'
        navigate({ to: to as any, replace: true })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setCredentials({ email: "", password: "", confirmPassword: "", firstName: "", middleName: "", lastName: "", badgeNumber: "" })
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Emergency Dispatch System</h1>
          <p className="text-muted-foreground">Secure access for authorized personnel only</p>
        </div>

        {/* Login/Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{isSignup ? "Officer Registration" : "Officer Login"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={credentials.firstName}
                        onChange={(e) => setCredentials((prev) => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={credentials.lastName}
                        onChange={(e) => setCredentials((prev) => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name </Label>
                    <Input
                      id="middleName"
                      type="text"
                      placeholder="Middle name"
                      value={credentials.middleName}
                      onChange={(e) => setCredentials((prev) => ({ ...prev, middleName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber">Badge Number</Label>
                    <Input
                      id="badgeNumber"
                      type="text"
                      placeholder="Enter your badge number"
                      value={credentials.badgeNumber}
                      onChange={(e) => setCredentials((prev) => ({ ...prev, badgeNumber: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : isSignup ? "Create Account" : "Access Dashboard"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
