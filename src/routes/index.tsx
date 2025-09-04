"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, MapPin, Search, Users, CheckCircle, XCircle, AlertCircle, User, LogOut, Loader2 } from "lucide-react"
import type { DatabaseReport } from "@/lib/types"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useAuthContext } from "@/auth/AuthProvider"
import { useReports } from "@/lib/useReports"
 
export const Route = createFileRoute("/")({
	beforeLoad: async ({ location }) => {
    const { supabase } = await import("@/lib/supabase")
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
  },
	component: DispatchDashboard
})





const getStatusIcon = (status: string) => {
	switch (status) {
		case "pending":
			return <Clock className="h-4 w-4" />
		case "assigned":
			return <Users className="h-4 w-4" />
		case "in-progress":
			return <AlertCircle className="h-4 w-4" />
		case "resolved":
			return <CheckCircle className="h-4 w-4" />
		case "cancelled":
			return <XCircle className="h-4 w-4" />
		default:
			return <Clock className="h-4 w-4" />
	}
}

const getStatusColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200"
		case "assigned":
			return "bg-blue-100 text-blue-800 border-blue-200"
		case "in-progress":
			return "bg-orange-100 text-orange-800 border-orange-200"
		case "resolved":
			return "bg-green-100 text-green-800 border-green-200"
		case "cancelled":
			return "bg-gray-100 text-gray-800 border-gray-200"
		default:
			return "bg-gray-100 text-gray-800 border-gray-200"
	}
}

const getPriorityColor = (priority: string) => {
	switch (priority || 'medium') {
		case "critical":
			return "bg-red-100 text-red-800 border-red-200"
		case "high":
			return "bg-orange-100 text-orange-800 border-orange-200"
		case "medium":
			return "bg-yellow-100 text-yellow-800 border-yellow-200"
		case "low":
			return "bg-green-100 text-green-800 border-green-200"
		default:
			return "bg-yellow-100 text-yellow-800 border-yellow-200" // Default to medium color
	}
}

export default function DispatchDashboard() {
	const { reports, loading, error, updateReportStatus } = useReports()
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [priorityFilter, setPriorityFilter] = useState("all")
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const { user: authUser, signOut } = useAuthContext()
	const navigate = useNavigate()

	const displayName = (() => {
		const meta = (authUser as any)?.user_metadata || {}
		const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ")
		return name || meta.badgenumber || authUser?.email || "Profile"
	})()

	const filteredReports = reports.filter((report) => {
		const matchesSearch =
			report.incident_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.street_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.id.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesStatus = statusFilter === "all" || report.status === statusFilter
		const matchesPriority = priorityFilter === "all" || (report.priority || 'medium') === priorityFilter

		return matchesSearch && matchesStatus && matchesPriority
	})



	const statusCounts = {
		pending: reports.filter((r) => r.status === "pending").length,
		assigned: reports.filter((r) => r.status === "assigned").length,
		inProgress: reports.filter((r) => r.status === "in-progress").length,
		resolved: reports.filter((r) => r.status === "resolved").length,
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Emergency Dispatch Dashboard</h1>
						<p className="text-muted-foreground">Real-time incident management and response coordination</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="flex items-center gap-2 bg-transparent">
								<User className="h-4 w-4" />
								{displayName}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								disabled={isLoggingOut}
								onClick={async () => {
									setIsLoggingOut(true)
									try {
										await signOut()
										navigate({ to: "/login", replace: true })
									} finally {
										setIsLoggingOut(false)
									}
								}}
							>
								{isLoggingOut ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<LogOut className="mr-2 h-4 w-4" />
								)}
								{isLoggingOut ? "Logging out..." : "Logout"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Status Overview Cards */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Pending</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statusCounts.pending}</div>
							<p className="text-xs text-muted-foreground">Awaiting assignment</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Assigned</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statusCounts.assigned}</div>
							<p className="text-xs text-muted-foreground">Units dispatched</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
							<AlertCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statusCounts.inProgress}</div>
							<p className="text-xs text-muted-foreground">Active responses</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Resolved</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{statusCounts.resolved}</div>
							<p className="text-xs text-muted-foreground">Completed today</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Search */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search incidents by ID, title, or location..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="assigned">Assigned</SelectItem>
							<SelectItem value="in-progress">In Progress</SelectItem>
							<SelectItem value="resolved">Resolved</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
					<Select value={priorityFilter} onValueChange={setPriorityFilter}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Filter by priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priorities</SelectItem>
							<SelectItem value="critical">Critical</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="low">Low</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Loading State */}
				{loading && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
								<p className="text-muted-foreground">Loading reports...</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Error State */}
				{error && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
								<h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
								<p className="text-muted-foreground mb-4">{error}</p>
								<Button onClick={() => window.location.reload()}>
									Retry
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Incidents List */}
				{!loading && !error && (
					<div className="space-y-4">
						{filteredReports.map((report) => (
						<Card key={report.id} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="font-mono">
												{report.id}
											</Badge>
											<Badge className={getPriorityColor(report.priority || 'medium')}>{(report.priority || 'medium').toUpperCase()}</Badge>
											<Badge className={getStatusColor(report.status)}>
												{getStatusIcon(report.status)}
												<span className="ml-1 capitalize">{report.status.replace("-", " ")}</span>
											</Badge>
										</div>
										<CardTitle className="text-lg">{report.incident_title}</CardTitle>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{report.street_address}, {report.city}
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												{report.incident_date} at {report.incident_time}
											</div>
											{report.assigned_to && (
												<div className="flex items-center gap-1">
													<Users className="h-4 w-4" />
													{report.assigned_to}
												</div>
											)}
										</div>
									</div>
									<div className="flex gap-2">
										<Select
											value={report.status}
											onValueChange={(value) => updateReportStatus(report.id, value as DatabaseReport["status"])}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="assigned">Assigned</SelectItem>
												<SelectItem value="in-progress">In Progress</SelectItem>
												<SelectItem value="resolved">Resolved</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue="overview" className="w-full">
									<TabsList className="grid w-full grid-cols-3">
										<TabsTrigger value="overview">Overview</TabsTrigger>
										<TabsTrigger value="details">Details</TabsTrigger>
										<TabsTrigger value="contacts">Contacts</TabsTrigger>
									</TabsList>
									<TabsContent value="overview" className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h4 className="font-semibold mb-2">Incident Summary</h4>
												<p className="text-sm text-muted-foreground">{report.brief_description}</p>
											</div>
											<div>
												<h4 className="font-semibold mb-2">Category</h4>
												<p className="text-sm">
													{report.incident_category} - {report.incident_subcategory}
												</p>
											</div>
										</div>
									</TabsContent>
									<TabsContent value="details" className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h4 className="font-semibold mb-2">What Happened</h4>
												<p className="text-sm text-muted-foreground">{report.what_happened}</p>
											</div>
											<div>
												<h4 className="font-semibold mb-2">Involved Parties</h4>
												<p className="text-sm text-muted-foreground">{report.who_was_involved}</p>
											</div>
											<div>
												<h4 className="font-semibold mb-2">Injuries</h4>
												<p className="text-sm text-muted-foreground">{report.injuries_reported || "None reported"}</p>
											</div>
											<div>
												<h4 className="font-semibold mb-2">Property Damage</h4>
												<p className="text-sm text-muted-foreground">{report.property_damage || "None reported"}</p>
											</div>
										</div>
									</TabsContent>
									<TabsContent value="contacts" className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<h4 className="font-semibold mb-2">Witnesses</h4>
												<p className="text-sm text-muted-foreground">{report.number_of_witnesses} witnesses</p>
											</div>
											<div>
												<h4 className="font-semibold mb-2">Contact Information</h4>
												<p className="text-sm text-muted-foreground">
													{report.witness_contact_info || "No contact info available"}
												</p>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
						))}
					</div>
				)}

				{!loading && !error && filteredReports.length === 0 && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No incidents found</h3>
								<p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
