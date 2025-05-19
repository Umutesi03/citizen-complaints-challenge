"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.target)
    const result = await login(formData)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      })

      // Redirect based on role
      if (result.role === "admin" || result.role === "institution_admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="absolute top-8 left-8 inline-flex items-center text-primary hover:underline">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">CitizenConnect</h1>
          <p className="text-sm text-muted-foreground">Access the citizen engagement platform</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="citizen">Citizen Access</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Government Staff Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@agency.gov.rw" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Access</CardTitle>
                <CardDescription>Track your complaint or submit a new one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking-id">Tracking ID</Label>
                  <Input id="tracking-id" placeholder="Enter your tracking ID (e.g., CMP-123456)" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full" onClick={() => router.push("/track")}>
                  Track Complaint
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have a tracking ID?</span>{" "}
                  <Link href="/submit" className="text-primary hover:underline">
                    Submit a new complaint
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
