"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, MapPin, Search, Users, CheckCircle, XCircle, AlertCircle, User, LogOut } from "lucide-react"
import type { ReportData } from "@/lib/types"
import { createFileRoute, redirect } from "@tanstack/react-router"
 
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

// Extended type with status for dispatch management
interface DispatchReport extends ReportData {
	id: string
	status: "pending" | "assigned" | "in-progress" | "resolved" | "cancelled"
	priority: "low" | "medium" | "high" | "critical"
	assigned_to?: string
	created_at: string
	updated_at: string
}

// Mock data for demonstration
const mockReports: DispatchReport[] = [
	{
		id: "RPT-001",
		incident_category: "Emergency",
		incident_subcategory: "Medical Emergency",
		incident_title: "Cardiac Arrest - Downtown Plaza",
		incident_date: "2024-01-15",
		incident_time: "14:30",
		street_address: "123 Main Street",
		nearby_landmark: "City Hall",
		city: "Toronto",
		province: "Ontario",
		brief_description: "Male, 65, collapsed in plaza",
		what_happened: "Elderly male collapsed suddenly while walking. Bystanders performing CPR.",
		who_was_involved: "Victim: John Doe, 65. Bystanders: 2 civilians providing aid",
		number_of_witnesses: "3",
		injuries_reported: "Cardiac arrest, unconscious",
		property_damage: "None",
		suspect_description: "N/A",
		witness_contact_info: "Jane Smith: 416-555-0123",
		request_follow_up: true,
		share_with_community: false,
		is_anonymous: false,
		status: "in-progress",
		priority: "critical",
		assigned_to: "Unit 12",
		created_at: "2024-01-15T14:32:00Z",
		updated_at: "2024-01-15T14:35:00Z",
	},
	{
		id: "RPT-002",
		incident_category: "Traffic",
		incident_subcategory: "Vehicle Accident",
		incident_title: "Multi-Vehicle Collision - Highway 401",
		incident_date: "2024-01-15",
		incident_time: "13:45",
		street_address: "Highway 401 Eastbound, KM 425",
		nearby_landmark: "Don Valley Parkway Exit",
		city: "Toronto",
		province: "Ontario",
		brief_description: "3-car collision blocking 2 lanes",
		what_happened: "Chain reaction collision during heavy traffic. Multiple vehicles involved.",
		who_was_involved: "3 drivers, 2 passengers",
		number_of_witnesses: "5",
		injuries_reported: "Minor injuries, 2 people",
		property_damage: "Significant vehicle damage, estimated $45,000",
		suspect_description: "N/A",
		witness_contact_info: "Multiple witnesses on scene",
		request_follow_up: true,
		share_with_community: true,
		is_anonymous: false,
		status: "assigned",
		priority: "high",
		assigned_to: "Unit 7, Unit 15",
		created_at: "2024-01-15T13:47:00Z",
		updated_at: "2024-01-15T13:50:00Z",
	},
	{
		id: "RPT-003",
		incident_category: "Crime",
		incident_subcategory: "Theft",
		incident_title: "Store Robbery - Queen Street",
		incident_date: "2024-01-15",
		incident_time: "12:15",
		street_address: "456 Queen Street West",
		nearby_landmark: "Subway Station",
		city: "Toronto",
		province: "Ontario",
		brief_description: "Armed robbery at convenience store",
		what_happened: "Masked individual entered store with weapon, demanded cash from register.",
		who_was_involved: "Store clerk (victim), 1 suspect",
		number_of_witnesses: "2",
		injuries_reported: "None",
		property_damage: "Broken glass door",
		suspect_description: "Male, 5'8\", black hoodie, face mask",
		witness_contact_info: "Store owner: 416-555-0456",
		request_follow_up: true,
		share_with_community: true,
		is_anonymous: false,
		status: "resolved",
		priority: "high",
		assigned_to: "Unit 3",
		created_at: "2024-01-15T12:18:00Z",
		updated_at: "2024-01-15T15:22:00Z",
	},
]

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
	switch (priority) {
		case "critical":
			return "bg-red-100 text-red-800 border-red-200"
		case "high":
			return "bg-orange-100 text-orange-800 border-orange-200"
		case "medium":
			return "bg-yellow-100 text-yellow-800 border-yellow-200"
		case "low":
			return "bg-green-100 text-green-800 border-green-200"
		default:
			return "bg-gray-100 text-gray-800 border-gray-200"
	}
}

export default function DispatchDashboard() {
	const [reports, setReports] = useState<DispatchReport[]>(mockReports)
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [priorityFilter, setPriorityFilter] = useState("all")
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [user, setUser] = useState({ name: "Officer Johnson", badge: "12345" })

	if (!isAuthenticated) {
	}

	const filteredReports = reports.filter((report) => {
		const matchesSearch =
			report.incident_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.street_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.id.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesStatus = statusFilter === "all" || report.status === statusFilter
		const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter

		return matchesSearch && matchesStatus && matchesPriority
	})

	const updateReportStatus = (reportId: string, newStatus: DispatchReport["status"]) => {
		setReports((prev) =>
			prev.map((report) =>
				report.id === reportId ? { ...report, status: newStatus, updated_at: new Date().toISOString() } : report,
			),
		)
	}

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
								{user.name}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsAuthenticated(false)}>
								<LogOut className="mr-2 h-4 w-4" />
								Logout
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

				{/* Incidents List */}
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
											<Badge className={getPriorityColor(report.priority)}>{report.priority.toUpperCase()}</Badge>
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
											onValueChange={(value) => updateReportStatus(report.id, value as DispatchReport["status"])}
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

				{filteredReports.length === 0 && (
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
