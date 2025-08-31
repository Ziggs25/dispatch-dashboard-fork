"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/login')({
	component: LoginScreen,
})

function LoginScreen() {
	const [isSignup, setIsSignup] = useState(false)
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		middleName: "",
		lastName: "",
	})
	const [isLoading, setIsLoading] = useState(false)

	const onLogin = () => { }

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		// Simulate authentication delay
		setTimeout(() => {
			setIsLoading(false)
			onLogin()
		}, 1000)
	}

	const toggleMode = () => {
		setIsSignup(!isSignup)
		setCredentials({ username: "", password: "", confirmPassword: "", firstName: "", middleName: "", lastName: "" })
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
								</>
							)}
							<div className="space-y-2">
								<Label htmlFor="username">Badge Number / Username</Label>
								<Input
									id="username"
									type="text"
									placeholder="Enter your badge number"
									value={credentials.username}
									onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
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
