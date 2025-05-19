"use client"

import { useState } from "react"
import { formatDate } from "@/lib/db"
import { FileText, MapPin, User, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { updateComplaintStatus, respondToComplaint } from "@/app/actions/complaints"
import { useToast } from "@/hooks/use-toast"

export function ComplaintDetailDialog({
  complaint,
  open,
  onOpenChange,
  onStatusUpdate,
}: {
  complaint: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: () => void
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responseType, setResponseType] = useState("message")
  const [responseMessage, setResponseMessage] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [newStatus, setNewStatus] = useState(complaint?.status || "submitted")

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

  const handleSubmitResponse = async () => {
    if (!complaint) return

    if (responseType === "message" && !responseMessage.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response message.",
        variant: "destructive",
      })
      return
    }

    if (responseType === "visit" && !visitDate) {
      toast({
        title: "Visit Date Required",
        description: "Please select a visit date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the response message
      let message = responseMessage
      if (responseType === "visit") {
        message = `A site visit has been scheduled for ${visitDate}. ${responseMessage}`
      }

      // Update the complaint status
      const statusResult = await updateComplaintStatus(complaint.id, newStatus, message)

      if (!statusResult.success) {
        throw new Error(statusResult.error || "Failed to update status")
      }

      // Send the response
      const responseResult = await respondToComplaint(complaint.id, message)

      if (!responseResult.success) {
        throw new Error(responseResult.error || "Failed to send response")
      }

      toast({
        title: "Response Sent",
        description: "Your response has been sent successfully.",
      })

      // Close the dialog and refresh the data
      onOpenChange(false)
      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Error responding to complaint:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while responding to the complaint.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!complaint) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{complaint.title}</span>
            <Badge variant="outline" className={getStatusColor(complaint.status)}>
              {formatStatus(complaint.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Tracking ID: {complaint.tracking_id} • Submitted: {formatDate(new Date(complaint.created_at))}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="respond">Respond</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Category
                </div>
                <p>
                  {complaint.category_name}
                  {complaint.subcategory_name && ` - ${complaint.subcategory_name}`}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Priority
                </div>
                <p className="capitalize">{complaint.priority}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Location
                </div>
                <p>{complaint.location}</p>
                <p className="text-sm text-muted-foreground">
                  {complaint.province} Province, {complaint.district} District
                  {complaint.sector && `, ${complaint.sector} Sector`}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" /> Contact Information
                </div>
                <p>{complaint.contact_info || "Not provided"}</p>
                <p className="text-sm text-muted-foreground">
                  {complaint.is_anonymous ? "Anonymous submission" : "Identity disclosed to institution"}
                </p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" /> Description
                </div>
                <p className="whitespace-pre-line">{complaint.description}</p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Timeline
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Submitted
                    </Badge>
                    <span>{formatDate(new Date(complaint.created_at))}</span>
                  </div>
                  {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Last Updated
                      </Badge>
                      <span>{formatDate(new Date(complaint.updated_at))}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4 pt-4">
            {complaint.updates && complaint.updates.length > 0 ? (
              <div className="space-y-4">
                {complaint.updates.map((update, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={getStatusColor(update.status)}>
                        {formatStatus(update.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(new Date(update.created_at))}</span>
                    </div>
                    <p className="whitespace-pre-line">{update.comment}</p>
                    {update.user_id && (
                      <p className="text-sm text-muted-foreground mt-2">Updated by: Staff ID {update.user_id}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No Updates Yet</h3>
                <p className="text-sm text-muted-foreground">This complaint has no status updates yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4 pt-4">
            {complaint.attachments && complaint.attachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaint.attachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center gap-3">
                    <div className="bg-muted rounded-md p-2">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.file_size / 1024).toFixed(1)} KB • {formatDate(new Date(attachment.created_at))}
                      </p>
                    </div>
                    {attachment.file_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={attachment.file_url} download target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No Attachments</h3>
                <p className="text-sm text-muted-foreground">No files were attached to this complaint.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="respond" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Update Status</Label>
                <RadioGroup value={newStatus} onValueChange={setNewStatus} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-500" /> Pending
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="under_review" id="under_review" />
                    <Label htmlFor="under_review" className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" /> Under Review
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in_progress" id="in_progress" />
                    <Label htmlFor="in_progress" className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-purple-500" /> In Progress
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="responded" id="responded" />
                    <Label htmlFor="responded" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-emerald-500" /> Responded
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="resolved" id="resolved" />
                    <Label htmlFor="resolved" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Resolved
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rejected" id="rejected" />
                    <Label htmlFor="rejected" className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" /> Rejected
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Response Type</Label>
                <RadioGroup value={responseType} onValueChange={setResponseType} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="message" id="message" />
                    <Label htmlFor="message">Message Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visit" id="visit" />
                    <Label htmlFor="visit">Schedule Visit</Label>
                  </div>
                </RadioGroup>
              </div>

              {responseType === "visit" && (
                <div className="space-y-2">
                  <Label htmlFor="visit-date">Visit Date</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="response">Response Message</Label>
                <Textarea
                  id="response"
                  placeholder={
                    responseType === "visit"
                      ? "Additional information about the scheduled visit..."
                      : "Enter your response to this complaint..."
                  }
                  rows={5}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSubmitResponse} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
