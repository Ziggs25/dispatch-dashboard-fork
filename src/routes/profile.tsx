"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Hash, Edit, Save, X, Loader2, ArrowLeft, LogOut } from "lucide-react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useAuthContext } from "@/auth/AuthProvider"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
  },
  component: ProfilePage,
})

interface ProfileData {
  first_name: string
  middle_name: string
  last_name: string
  badgenumber: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    badgenumber: "",
  })

  const [editedData, setEditedData] = useState<ProfileData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    badgenumber: "",
  })

  useEffect(() => {
    if (user) {
      const meta = (user as any)?.user_metadata || {}
      const data = {
        first_name: meta.first_name || "",
        middle_name: meta.middle_name || "",
        last_name: meta.last_name || "",
        badgenumber: meta.badgenumber || "",
      }
      setProfileData(data)
      setEditedData(data)
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setSuccess(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData(profileData)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: editedData.first_name,
          middle_name: editedData.middle_name,
          last_name: editedData.last_name,
          badgenumber: editedData.badgenumber,
        },
      })

      if (updateError) throw updateError

      // Update local state
      setProfileData(editedData)
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      navigate({ to: "/login", replace: true })
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err instanceof Error ? err.message : "Failed to sign out")
    } finally {
      setIsLoggingOut(false)
      setShowSignOutDialog(false)
    }
  }

  const displayName = (() => {
    const name = [profileData.first_name, profileData.last_name].filter(Boolean).join(" ")
    return name || profileData.badgenumber || user?.email || "User"
  })()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate({ to: "/" })}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Save className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              {profileData.badgenumber && (
                <Badge variant="outline" className="h-8 px-4 text-base">
                  <Hash className="mr-1 h-4 w-4" />
                  {profileData.badgenumber}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={editedData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                      {profileData.first_name || <span className="text-muted-foreground">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Middle Name */}
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name</Label>
                  {isEditing ? (
                    <Input
                      id="middle_name"
                      value={editedData.middle_name}
                      onChange={(e) => handleInputChange("middle_name", e.target.value)}
                      placeholder="Enter middle name (optional)"
                    />
                  ) : (
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                      {profileData.middle_name || <span className="text-muted-foreground">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={editedData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                      {profileData.last_name || <span className="text-muted-foreground">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Badge Number */}
                <div className="space-y-2">
                  <Label htmlFor="badgenumber">Badge Number</Label>
                  {isEditing ? (
                    <Input
                      id="badgenumber"
                      value={editedData.badgenumber}
                      onChange={(e) => handleInputChange("badgenumber", e.target.value)}
                      placeholder="Enter badge number"
                    />
                  ) : (
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                      {profileData.badgenumber || <span className="text-muted-foreground">Not set</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Account Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted px-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user?.email || <span className="text-muted-foreground">No email</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from this page
                  </p>
                </div>

                {/* User ID */}
                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 font-mono text-xs">
                    {user?.id || <span className="text-muted-foreground">No ID</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Sign Out Button */}
            <div className="flex justify-center border-t pt-6">
              <Button
                onClick={() => setShowSignOutDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-base"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Sign Out</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to sign out? You will need to log in again to access the dashboard.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSignOutDialog(false)}
                disabled={isLoggingOut}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
