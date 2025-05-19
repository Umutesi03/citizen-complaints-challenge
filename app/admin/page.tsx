"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, Filter, Inbox, LogOut, MessageSquare, Search, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ComplaintDetailDialog } from "@/components/complaint-detail-dialog"
import { getUser, logout } from "@/app/actions/auth"
import { getComplaints, getComplaintByTrackingId } from "@/app/actions/complaints"
import { formatDate } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoadingComplaint, setIsLoadingComplaint] = useState(false)

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
        setError("Authentication failed. Please log in again.")
        router.push("/login")
      } finally {
        setIsAuthChecked(true)
      }
    }

    checkAuth()
  }, [router, toast])

  useEffect(() => {
    async function fetchComplaints() {
      if (!user) return

      try {
        setLoading(true)
        const data = await getComplaints(user?.institutionId, statusFilter !== "all" ? statusFilter : undefined)
        // Ensure complaints is always an array
        setComplaints(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching complaints:", error)
        setError("Failed to load complaints. Please try again.")
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }

    if (isAuthChecked && user) {
      fetchComplaints()
    }
  }, [user, statusFilter, isAuthChecked])

  // Ensure complaints is an array before filtering
  const filteredComplaints = Array.isArray(complaints)
    ? complaints.filter((complaint) => {
        // Filter by search query
        if (
          searchQuery &&
          !complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !complaint.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false
        }
        return true
      })
    : []

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "responded":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const formatStatus = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleViewComplaint = async (complaintId) => {
    try {
      setIsLoadingComplaint(true)
      // Find the complaint in our existing data
      const complaint = complaints.find((c) => c.id === complaintId)

      if (!complaint) {
        toast({
          title: "Error",
          description: "Complaint not found",
          variant: "destructive",
        })
        return
      }

      // Fetch the full complaint details including updates and attachments
      const complaintDetails = await getComplaintByTrackingId(complaint.tracking_id)

      if (!complaintDetails) {
        toast({
          title: "Error",
          description: "Failed to load complaint details",
          variant: "destructive",
        })
        return
      }

      setSelectedComplaint(complaintDetails)
      setIsDetailDialogOpen(true)
    } catch (error) {
      console.error("Error loading complaint details:", error)
      toast({
        title: "Error",
        description: "Failed to load complaint details: " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingComplaint(false)
    }
  }

  const handleRespondToComplaint = async (complaintId) => {
    try {
      setIsLoadingComplaint(true)
      // Find the complaint in our existing data
      const complaint = complaints.find((c) => c.id === complaintId)

      if (!complaint) {
        toast({
          title: "Error",
          description: "Complaint not found",
          variant: "destructive",
        })
        return
      }

      // Fetch the full complaint details
      const complaintDetails = await getComplaintByTrackingId(complaint.tracking_id)

      if (!complaintDetails) {
        toast({
          title: "Error",
          description: "Failed to load complaint details",
          variant: "destructive",
        })
        return
      }

      setSelectedComplaint(complaintDetails)
      setIsDetailDialogOpen(true)

      // We'll automatically switch to the respond tab in the dialog
      // This is handled in the dialog component
    } catch (error) {
      console.error("Error loading complaint details:", error)
      toast({
        title: "Error",
        description: "Failed to load complaint details: " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingComplaint(false)
    }
  }

  const refreshComplaints = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getComplaints(user?.institutionId, statusFilter !== "all" ? statusFilter : undefined)
      setComplaints(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error refreshing complaints:", error)
      toast({
        title: "Error",
        description: "Failed to refresh complaints",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthChecked || !user) {
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
                      <SidebarMenuButton isActive>
                        <Inbox />
                        <span>Complaints</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{Array.isArray(complaints) ? complaints.length : 0}</SidebarMenuBadge>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
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
                <h1 className="text-xl font-semibold">Complaint Management</h1>
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
            <Card>
              <CardHeader>
                <CardTitle>Manage Complaints</CardTitle>
                <CardDescription>View, assign, and respond to citizen complaints.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID or title..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">Export</Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
                    <div className="col-span-5 md:col-span-4">Complaint</div>
                    <div className="col-span-3 hidden md:block">Category</div>
                    <div className="col-span-3 md:col-span-2">Status</div>
                    <div className="col-span-4 md:col-span-3">Actions</div>
                  </div>

                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading complaints...</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-destructive mb-2" />
                      <h3 className="font-medium mb-1">Error</h3>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  ) : filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0"
                      >
                        <div className="col-span-5 md:col-span-4">
                          <div className="font-medium">{complaint.title}</div>
                          <div className="text-sm text-muted-foreground">{complaint.tracking_id}</div>
                          <div className="text-xs text-muted-foreground md:hidden mt-1">{complaint.category_name}</div>
                        </div>
                        <div className="col-span-3 hidden md:block">
                          <div>{complaint.category_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(new Date(complaint.created_at))}
                          </div>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Badge variant="outline" className={getStatusColor(complaint.status)}>
                            {formatStatus(complaint.status)}
                          </Badge>
                        </div>
                        <div className="col-span-4 md:col-span-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewComplaint(complaint.id)}
                            disabled={isLoadingComplaint}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRespondToComplaint(complaint.id)}
                            disabled={isLoadingComplaint}
                          >
                            Respond
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium mb-1">No complaints found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Complaint Detail Dialog */}
      <ComplaintDetailDialog
        complaint={selectedComplaint}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onStatusUpdate={refreshComplaints}
      />
    </SidebarProvider>
  )
}
