'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Paperclip,
  Download,
  ImageIcon,
  File,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getComplaintByTrackingId } from '@/app/actions/complaints';
import { formatDate } from '@/lib/db';

export default function TrackComplaint() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams?.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams?.get('id')) {
      setTrackingId(searchParams.get('id'));
      handleSearch();
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!trackingId) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await getComplaintByTrackingId(trackingId);
      console.log('Complaint result:', result);
      if (!result) {
        setError(`No complaint found with tracking ID: ${trackingId}`);
        setComplaint(null);
      } else {
        setComplaint(result);
      }
    } catch (err) {
      console.error('Error fetching complaint:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching the complaint'
      );
      setComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getFileIcon = (fileType) => {
    if (fileType && fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-primary hover:underline mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Track Your Complaint</CardTitle>
          <CardDescription>
            Enter your tracking ID to check the status of your complaint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Input
              placeholder="Enter tracking ID (e.g., CMP-123456)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || !trackingId}>
              {isLoading ? 'Searching...' : 'Track'}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="animate-spin h-8 w-8 mx-auto text-primary mb-4" />
              <p>Searching for your complaint...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {error.includes('high traffic')
                    ? 'Our system is currently experiencing high traffic. This is a temporary issue.'
                    : 'There was a problem retrieving your complaint information.'}
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={handleSearch} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : complaint ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{complaint.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {complaint.tracking_id}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {formatStatus(complaint.status)}
                </div>
              </div>

              <Separator />

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Category
                      </h4>
                      <p>
                        {complaint.category_name}
                        {complaint.subcategory_name &&
                          ` - ${complaint.subcategory_name}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Priority
                      </h4>
                      <p>
                        {complaint.priority.charAt(0).toUpperCase() +
                          complaint.priority.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Submitted
                      </h4>
                      <p>{formatDate(new Date(complaint.created_at))}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </h4>
                      <p>{formatDate(new Date(complaint.updated_at))}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Location
                      </h4>
                      <p>{complaint.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {complaint.province} Province, {complaint.district}{' '}
                        District
                        {complaint.sector && `, ${complaint.sector} Sector`}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Assigned To
                      </h4>
                      <p>
                        {complaint.institution_name || 'Pending Assignment'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h4>
                      <p>{complaint.description}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="updates" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    {complaint.updates && complaint.updates.length > 0 ? (
                      complaint.updates.map((update, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                                update.status
                              )}`}
                            >
                              {formatStatus(update.status)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(new Date(update.created_at))}
                            </span>
                          </div>
                          <p className="text-sm">{update.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p>No updates available for this complaint yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="attachments" className="space-y-4 pt-4">
                  {complaint.attachments && complaint.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaint.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 flex items-center gap-3"
                        >
                          <div className="bg-muted rounded-md p-2">
                            {getFileIcon(attachment.file_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {attachment.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.file_size / 1024).toFixed(1)} KB •{' '}
                              {formatDate(new Date(attachment.created_at))}
                            </p>
                          </div>
                          {attachment.file_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={attachment.file_url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 border rounded-lg border-dashed">
                      <div className="text-center">
                        <Paperclip className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="font-medium">No Attachments</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          No files or images have been attached to this
                          complaint.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="messages" className="space-y-4 pt-4">
                  {complaint.messages && complaint.messages.length > 0 ? (
                    <div className="space-y-4">
                      {complaint.messages.map((msg, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-muted"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-primary">
                              From: {msg.sender_name || 'Unknown'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(new Date(msg.created_at))}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 border rounded-lg border-dashed">
                      <div className="text-center">
                        <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="font-medium">No Messages Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Messages from the assigned department will appear
                          here.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          ) : trackingId ? (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Complaint Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find a complaint with the tracking ID: {trackingId}
              </p>
              <p className="text-sm text-muted-foreground">
                Please check the ID and try again, or submit a new complaint.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Enter Your Tracking ID
              </h3>
              <p className="text-muted-foreground">
                Enter the tracking ID you received when you submitted your
                complaint.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
