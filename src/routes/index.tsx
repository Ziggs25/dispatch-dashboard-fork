"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Clock, MapPin, Search, Users, CheckCircle, XCircle, AlertCircle, User, LogOut, Loader2, Plus, Save } from "lucide-react"
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
  component: DispatchDashboard,
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
  switch (priority || "medium") {
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
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string>("")
  const [addReportModalOpen, setAddReportModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddTooltip, setShowAddTooltip] = useState(false)
  const [newReport, setNewReport] = useState({
    incident_title: "",
    incident_category: "theft",
    incident_subcategory: "vehicle",
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    street_address: "",
    city: "",
    province: "",
    brief_description: "",
    what_happened: "",
    who_was_involved: "",
    priority: "medium" as const,
  })

  const handleMobileStatusSelect = (reportId: string, status: string) => {
    updateReportStatus(reportId, status as DatabaseReport["status"])
    setMobileModalOpen(false)
    setSelectedReportId("")
  }
  
  const handleInputChange = (field: string, value: string) => {
    setNewReport(prev => ({ ...prev, [field]: value }))
  }
  
  const handleAddReport = async () => {
    try {
      setIsSubmitting(true)
      
      const { supabase } = await import("@/lib/supabase")
      
      // Basic validation
      if (!newReport.incident_title || !newReport.street_address || !newReport.brief_description) {
        throw new Error("Please fill in all required fields")
      }
      
      const reportData = {
        ...newReport,
        nearby_landmark: null,
        number_of_witnesses: null,
        injuries_reported: null,
        property_damage: null,
        suspect_description: null,
        witness_contact_info: null,
        request_follow_up: false,
        share_with_community: true,
        is_anonymous: false,
        status: "pending" as const,
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const { error } = await supabase
        .from('reports')
        .insert(reportData)
        
      if (error) throw error
      
      // Reset form and close modal on success
      setNewReport({
        incident_title: "",
        incident_category: "theft",
        incident_subcategory: "vehicle",
        incident_date: new Date().toISOString().split('T')[0],
        incident_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        street_address: "",
        city: "",
        province: "",
        brief_description: "",
        what_happened: "",
        who_was_involved: "",
        priority: "medium" as const,
      })
      setAddReportModalOpen(false)
      
    } catch (err) {
      console.error("Error adding report:", err)
      alert(err instanceof Error ? err.message : "Failed to add report")
    } finally {
      setIsSubmitting(false)
    }
  }

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
    const matchesPriority = priorityFilter === "all" || (report.priority || "medium") === priorityFilter

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
                onClick={() => navigate({ to: "/profile" })}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
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
                {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incidents List */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          {report.id}
                        </Badge>
                        <Badge className={getPriorityColor(report.priority || "medium")}>
                          {(report.priority || "medium").toUpperCase()}
                        </Badge>
                        <div className="hidden md:block">
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status.replace("-", " ")}</span>
                          </Badge>
                        </div>
                        <div className="md:hidden">
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status.replace("-", " ")}</span>
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg pr-4">{report.incident_title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                    <div className="hidden md:block">
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
                <CardContent className="relative pt-2 pb-16">
                  <div className="absolute bottom-2 right-4 md:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReportId(report.id)
                        setMobileModalOpen(true)
                      }}
                      className="w-[140px]"
                    >
                      <span className="capitalize">{report.status.replace("-", " ")}</span>
                    </Button>
                  </div>

                  <Tabs defaultValue="overview" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4 mt-1 pb-0 md:pb-0">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pr-0 md:pr-36">
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
                    <TabsContent value="details" className="space-y-4 mt-1 pb-0 md:pb-0">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pr-0 md:pr-36">
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
                    <TabsContent value="contacts" className="space-y-4 mt-1 pb-0 md:pb-0">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pr-0 md:pr-36">
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

      {/* Mobile status selection modal */}
      <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {[
              { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4" /> },
              { value: "assigned", label: "Assigned", icon: <Users className="h-4 w-4" /> },
              { value: "in-progress", label: "In Progress", icon: <AlertCircle className="h-4 w-4" /> },
              { value: "resolved", label: "Resolved", icon: <CheckCircle className="h-4 w-4" /> },
              { value: "cancelled", label: "Cancelled", icon: <XCircle className="h-4 w-4" /> },
            ].map((status) => (
              <Button
                key={status.value}
                variant="outline"
                className="justify-start h-12 bg-transparent"
                onClick={() => handleMobileStatusSelect(selectedReportId, status.value)}
              >
                <div className="flex items-center gap-3">
                  {status.icon}
                  <span>{status.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Report Modal */}
      <Dialog open={addReportModalOpen} onOpenChange={setAddReportModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Incident Title */}
              <div className="space-y-2">
                <Label htmlFor="incident_title">Incident Title *</Label>
                <Input 
                  id="incident_title" 
                  value={newReport.incident_title} 
                  onChange={(e) => handleInputChange("incident_title", e.target.value)}
                  placeholder="Enter incident title"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newReport.priority} 
                  onValueChange={(value) => handleInputChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="incident_category">Category *</Label>
                <Select 
                  value={newReport.incident_category} 
                  onValueChange={(value) => handleInputChange("incident_category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="disturbance">Disturbance</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="traffic">Traffic Incident</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <Label htmlFor="incident_subcategory">Subcategory *</Label>
                <Select 
                  value={newReport.incident_subcategory} 
                  onValueChange={(value) => handleInputChange("incident_subcategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="incident_date">Date *</Label>
                <Input 
                  id="incident_date" 
                  type="date" 
                  value={newReport.incident_date} 
                  onChange={(e) => handleInputChange("incident_date", e.target.value)}
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="incident_time">Time *</Label>
                <Input 
                  id="incident_time" 
                  type="time" 
                  value={newReport.incident_time} 
                  onChange={(e) => handleInputChange("incident_time", e.target.value)}
                />
              </div>

              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address *</Label>
                <Input 
                  id="street_address" 
                  value={newReport.street_address} 
                  onChange={(e) => handleInputChange("street_address", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  value={newReport.city} 
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province">Province/State *</Label>
                <Input 
                  id="province" 
                  value={newReport.province} 
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  placeholder="Enter province or state"
                />
              </div>
            </div>

            {/* Brief Description */}
            <div className="space-y-2">
              <Label htmlFor="brief_description">Brief Description *</Label>
              <Input 
                id="brief_description" 
                value={newReport.brief_description} 
                onChange={(e) => handleInputChange("brief_description", e.target.value)}
                placeholder="Enter a brief description of the incident"
              />
            </div>

            {/* What Happened */}
            <div className="space-y-2">
              <Label htmlFor="what_happened">What Happened *</Label>
              <Input 
                id="what_happened" 
                value={newReport.what_happened} 
                onChange={(e) => handleInputChange("what_happened", e.target.value)}
                placeholder="Describe what happened"
              />
            </div>

            {/* Who Was Involved */}
            <div className="space-y-2">
              <Label htmlFor="who_was_involved">Who Was Involved *</Label>
              <Input 
                id="who_was_involved" 
                value={newReport.who_was_involved} 
                onChange={(e) => handleInputChange("who_was_involved", e.target.value)}
                placeholder="Describe who was involved"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddReportModalOpen(false)}
                disabled={isSubmitting}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddReport} 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          <Button 
            className={`h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 flex items-center ${showAddTooltip ? 'px-6 w-auto' : 'w-14 justify-center'}`}
            onClick={() => setAddReportModalOpen(true)}
            onMouseEnter={() => setShowAddTooltip(true)}
            onMouseLeave={() => setShowAddTooltip(false)}
          >
            {showAddTooltip ? (
              <span className="flex items-center gap-2">
                <Plus className="h-6 w-6" />
                Add Report
              </span>
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
