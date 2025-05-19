"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, Inbox, LogOut, MessageSquare, Settings, User } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ComplaintDetailDialog } from "@/components/complaint-detail-dialog"
import { getUser, logout } from "@/app/actions/auth"
import { getDashboardStats, getComplaintByTrackingId } from "@/app/actions/dashboard"
import { useToast } from "@/hooks/use-toast"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    byStatus: [],
    byCategory: [],
    byProvince: [],
    recent: [],
    avgResolutionDays: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("all")
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
      }
    }

    checkAuth()
  }, [router, toast])

  useEffect(() => {
    async function fetchStats() {
      if (!user) return

      try {
        setLoading(true)
        const data = await getDashboardStats(user?.institutionId)

        if (data.error) {
          setError(data.error)
        } else {
          setStats({
            total: data.total || 0,
            byStatus: data.byStatus || [],
            byCategory: data.byCategory || [],
            byProvince: data.byProvince || [],
            recent: data.recent || [],
            avgResolutionDays: data.avgResolutionDays || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setError("Failed to load dashboard statistics. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, timeRange])

  // Prepare data for charts
  const prepareStatusData = () => {
    if (!stats || !stats.byStatus || !Array.isArray(stats.byStatus)) return []

    return stats.byStatus.map((item) => ({
      name: item.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: Number(item.count),
    }))
  }

  const prepareCategoryData = () => {
    if (!stats || !stats.byCategory || !Array.isArray(stats.byCategory)) return []

    return stats.byCategory.map((item) => ({
      name: item.category,
      count: Number(item.count),
    }))
  }

  const prepareProvinceData = () => {
    if (!stats || !stats.byProvince || !Array.isArray(stats.byProvince)) return []

    return stats.byProvince.map((item) => ({
      name: item.province,
      count: Number(item.count),
    }))
  }

  const formatStatus = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

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

  const handleViewComplaint = async (complaintId) => {
    try {
      setIsLoadingComplaint(true)
      // Find the complaint in our existing data
      const complaint = stats.recent.find((c) => c.id === complaintId)

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
      const complaint = stats.recent.find((c) => c.id === complaintId)

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

  const refreshStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getDashboardStats(user?.institutionId)

      if (data.error) {
        setError(data.error)
      } else {
        setStats({
          total: data.total || 0,
          byStatus: data.byStatus || [],
          byCategory: data.byCategory || [],
          byProvince: data.byProvince || [],
          recent: data.recent || [],
          avgResolutionDays: data.avgResolutionDays || 0,
        })
      }
    } catch (error) {
      console.error("Error refreshing dashboard stats:", error)
      toast({
        title: "Error",
        description: "Failed to refresh dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                      <SidebarMenuButton isActive>
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
                      <SidebarMenuButton>
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
                <h1 className="text-xl font-semibold">Dashboard Analytics</h1>
              </div>
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                      <Inbox className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.avgResolutionDays
                          ? `Avg. ${stats.avgResolutionDays.toFixed(1)} days to resolve`
                          : "No resolution data"}
                      </p>
                    </CardContent>
                  </Card>

                  {stats?.byStatus &&
                    Array.isArray(stats.byStatus) &&
                    stats.byStatus.map((status, index) => {
                      if (["submitted", "pending", "responded"].includes(status.status) && index < 3) {
                        return (
                          <Card key={status.status}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">{formatStatus(status.status)}</CardTitle>
                              <Badge variant="outline" className={getStatusColor(status.status)}>
                                {formatStatus(status.status)}
                              </Badge>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{status.count}</div>
                              <p className="text-xs text-muted-foreground">
                                {stats.total > 0 ? Math.round((Number(status.count) / stats.total) * 100) : 0}% of total
                              </p>
                            </CardContent>
                          </Card>
                        )
                      }
                      return null
                    })}
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="complaints">Complaints</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Complaints by Status</CardTitle>
                          <CardDescription>Distribution of complaints by current status</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ChartContainer
                            config={{
                              status: {
                                label: "Status",
                                color: "hsl(var(--chart-1))",
                              },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={prepareStatusData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {prepareStatusData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Complaints by Category</CardTitle>
                          <CardDescription>Top categories with most complaints</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ChartContainer
                            config={{
                              count: {
                                label: "Count",
                                color: "hsl(var(--chart-1))",
                              },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={prepareCategoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Complaints" />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="categories" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Complaints by Category</CardTitle>
                        <CardDescription>Detailed breakdown of complaints by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {stats?.byCategory &&
                            Array.isArray(stats.byCategory) &&
                            stats.byCategory.map((category) => (
                              <div key={category.category} className="flex items-center">
                                <div className="w-1/3 font-medium truncate">{category.category}</div>
                                <div className="w-2/3 flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${stats.total > 0 ? (Number(category.count) / stats.total) * 100 : 0}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{category.count}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="locations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Complaints by Province</CardTitle>
                        <CardDescription>Geographic distribution of complaints</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ChartContainer
                          config={{
                            count: {
                              label: "Count",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareProvinceData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip content={<ChartTooltip />} />
                              <Legend />
                              <Bar dataKey="count" fill="#82ca9d" name="Complaints" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="complaints" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>All Complaints</CardTitle>
                        <CardDescription>Detailed list of all complaints in the system</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
                            <div className="col-span-5 md:col-span-4">Complaint</div>
                            <div className="col-span-3 hidden md:block">Category</div>
                            <div className="col-span-3 md:col-span-2">Status</div>
                            <div className="col-span-4 md:col-span-3">Actions</div>
                          </div>

                          {stats?.recent && Array.isArray(stats.recent) && stats.recent.length > 0 ? (
                            stats.recent.map((complaint) => (
                              <div
                                key={complaint.id}
                                className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0"
                              >
                                <div className="col-span-5 md:col-span-4">
                                  <div className="font-medium">{complaint.title}</div>
                                  <div className="text-sm text-muted-foreground">{complaint.tracking_id}</div>
                                  <div className="text-xs text-muted-foreground md:hidden mt-1">
                                    {complaint.category_name}
                                  </div>
                                </div>
                                <div className="col-span-3 hidden md:block">
                                  <div>{complaint.category_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(complaint.created_at).toLocaleDateString()}
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
                              <p>No complaints found.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Complaint Detail Dialog */}
      <ComplaintDetailDialog
        complaint={selectedComplaint}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onStatusUpdate={refreshStats}
      />
    </SidebarProvider>
  )
}
