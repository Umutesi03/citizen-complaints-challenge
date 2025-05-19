import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, FileText, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <h1 className="text-xl font-bold">CitizenConnect</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="font-medium hover:underline">
                Home
              </Link>
              <Link href="/submit" className="font-medium hover:underline">
                Submit Complaint
              </Link>
              <Link href="/track" className="font-medium hover:underline">
                Track Status
              </Link>
              <Link href="/about" className="font-medium hover:underline">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="bg-white text-primary hover:bg-gray-100">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Your Voice Matters</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Submit complaints, provide feedback, and help improve public services in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Submit a Complaint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-foreground/10">
                  Track Your Complaint
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Submit</CardTitle>
                  <CardDescription>
                    Fill out a simple form with details about your complaint or feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Provide information about the issue, location, and relevant details. Upload photos if needed.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/submit" className="text-primary hover:underline">
                    Start a submission
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Track</CardTitle>
                  <CardDescription>Monitor the status of your complaint as it's processed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Use your unique tracking ID to check updates, status changes, and responses from agencies.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/track" className="text-primary hover:underline">
                    Track a complaint
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Resolve</CardTitle>
                  <CardDescription>
                    Receive updates as your issue is addressed by the appropriate agency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Get notified when your complaint is resolved and provide feedback on the resolution process.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/about" className="text-primary hover:underline">
                    Learn more
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Recent Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Road Repair Completed</CardTitle>
                  <CardDescription>Pothole fixed within 7 days of reporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    "I reported a dangerous pothole on Main Street that had been causing problems for months. Within a
                    week, the Public Works department had repaired it completely. The system made it easy to submit my
                    complaint and track the progress."
                  </p>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Submitted by John D. - Resolved by Public Works Department
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Street Light Replacement</CardTitle>
                  <CardDescription>Dark intersection made safe again</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    "After months of calling different offices with no results, I submitted a complaint about broken
                    street lights at a busy intersection. The Utilities Department responded within 48 hours and
                    replaced all the lights within a week. This system works!"
                  </p>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Submitted by Sarah M. - Resolved by Utilities Department
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">CitizenConnect</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bridging the gap between citizens and government services.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/submit" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Submit Complaint
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Track Status
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:underline">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Government Agencies</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Public Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Utilities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Transportation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <address className="text-sm text-gray-600 dark:text-gray-400 not-italic">
                <p>City Hall</p>
                <p>123 Government St.</p>
                <p>support@citizenconnect.gov</p>
                <p>(555) 123-4567</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} CitizenConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
