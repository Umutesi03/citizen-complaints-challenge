"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, Bell, Inbox, LogOut, MessageSquare, Settings, User, Globe, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUser, logout } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getUser()
        if (!userData || (userData.role !== "admin" && userData.role !== "institution_admin")) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the admin dashboard",
            variant: "destructive",
          })
          router.push("/login")
          return
        }
        setUser(userData)
      } catch (err) {
        console.error("Auth error:", err)
        toast({
          title: "Authentication Failed",
          description: "Please log in again",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const handleSaveProfile = () => {
    setSaving(true)

    // Simulate saving
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setSaving(true)

    // Simulate saving
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      })
    }, 1000)
  }

  const handleSavePassword = () => {
    setSaving(true)

    // Simulate saving
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">CitizenConnect</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/admin/dashboard">
                      <SidebarMenuButton>
                        <BarChart3 />
                        <span>Analytics</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin">
                      <SidebarMenuButton>
                        <Inbox />
                        <span>Complaints</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/admin/settings">
                      <SidebarMenuButton isActive>
                        <Settings />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Departments</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Public Works</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Transportation</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Utilities</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Public Safety</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Sanitation</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User />
                  <span>{user?.fullName || "Admin User"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <form action={logout}>
                  <SidebarMenuButton asChild>
                    <button type="submit" className="w-full flex items-center gap-2">
                      <LogOut />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                  <AvatarFallback>
                    {user?.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "AD"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account profile information and settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                          <AvatarFallback className="text-2xl">
                            {user?.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" defaultValue={user?.fullName || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                              id="role"
                              defaultValue={
                                user?.role?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || ""
                              }
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Select defaultValue="1">
                              <SelectTrigger id="institution">
                                <SelectValue placeholder="Select institution" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Ministry of Local Government</SelectItem>
                                <SelectItem value="2">Kigali City Council</SelectItem>
                                <SelectItem value="3">Rwanda Development Board</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" placeholder="Tell us about yourself" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Language & Region</CardTitle>
                    <CardDescription>Set your language and regional preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="rw">Kinyarwanda</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="africa-kigali">
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="africa-kigali">Africa/Kigali (GMT+2)</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Reset
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how you receive notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-new-complaints" className="flex-1">
                            New complaints
                          </Label>
                          <Switch id="email-new-complaints" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-status-updates" className="flex-1">
                            Status updates
                          </Label>
                          <Switch id="email-status-updates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-messages" className="flex-1">
                            New messages
                          </Label>
                          <Switch id="email-messages" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-reports" className="flex-1">
                            Weekly reports
                          </Label>
                          <Switch id="email-reports" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" /> System Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-new-complaints" className="flex-1">
                            New complaints
                          </Label>
                          <Switch id="system-new-complaints" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-status-updates" className="flex-1">
                            Status updates
                          </Label>
                          <Switch id="system-status-updates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-messages" className="flex-1">
                            New messages
                          </Label>
                          <Switch id="system-messages" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="system-reports" className="flex-1">
                            Weekly reports
                          </Label>
                          <Switch id="system-reports" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" /> SMS Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-new-complaints" className="flex-1">
                            High priority complaints
                          </Label>
                          <Switch id="sms-new-complaints" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-status-updates" className="flex-1">
                            Critical status updates
                          </Label>
                          <Switch id="sms-status-updates" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-messages" className="flex-1">
                            Urgent messages
                          </Label>
                          <Switch id="sms-messages" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSavePassword} disabled={saving}>
                      {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Protect your account with an additional security layer.
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Management</CardTitle>
                    <CardDescription>Manage your active sessions and devices.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">Current Session</h3>
                          <p className="text-sm text-muted-foreground">
                            Chrome on Windows • Kigali, Rwanda • Active now
                          </p>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">Mobile App</h3>
                          <p className="text-sm text-muted-foreground">
                            Android • Kigali, Rwanda • Last active 2 hours ago
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Sign Out All Other Sessions
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                    <CardDescription>Customize the appearance of the dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme Mode</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                          <div className="h-20 bg-white border rounded-md mb-2"></div>
                          <p className="text-center text-sm font-medium">Light</p>
                        </div>
                        <div className="border rounded-md p-4 cursor-pointer hover:border-primary">
                          <div className="h-20 bg-gray-900 border rounded-md mb-2"></div>
                          <p className="text-center text-sm font-medium">Dark</p>
                        </div>
                        <div className="border rounded-md p-4 cursor-pointer hover:border-primary border-primary">
                          <div className="h-20 bg-gradient-to-b from-white to-gray-900 border rounded-md mb-2"></div>
                          <p className="text-center text-sm font-medium">System</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="h-8 rounded-md bg-blue-500 cursor-pointer"></div>
                        <div className="h-8 rounded-md bg-green-500 cursor-pointer"></div>
                        <div className="h-8 rounded-md bg-purple-500 cursor-pointer"></div>
                        <div className="h-8 rounded-md bg-red-500 cursor-pointer"></div>
                        <div className="h-8 rounded-md bg-orange-500 cursor-pointer"></div>
                        <div className="h-8 rounded-md bg-pink-500 cursor-pointer"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Reset to Default
                    </Button>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
