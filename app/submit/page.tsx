"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Camera, ChevronLeft, MapPin, Upload, Loader2, X, ImageIcon, MapPinIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getCategories, submitComplaint } from "@/app/actions/complaints"

// Rwanda provinces and districts
const RWANDA_PROVINCES = [
  { name: "Kigali", districts: ["Gasabo", "Kicukiro", "Nyarugenge"] },
  { name: "Eastern", districts: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"] },
  { name: "Northern", districts: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"] },
  {
    name: "Southern",
    districts: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  },
  { name: "Western", districts: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"] },
]

export default function SubmitComplaint() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    title: "",
    description: "",
    location: "",
    province: "",
    district: "",
    sector: "",
    priority: "medium",
    contact: "",
    anonymous: false,
  })
  const [districts, setDistricts] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [toast])

  useEffect(() => {
    if (formData.province) {
      const province = RWANDA_PROVINCES.find((p) => p.name === formData.province)
      setDistricts(province ? province.districts : [])
      if (!province?.districts.includes(formData.district)) {
        setFormData((prev) => ({ ...prev, district: "" }))
      }
    } else {
      setDistricts([])
    }
  }, [formData.province])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.location.trim()) errors.location = "Location is required"
    if (!formData.province) errors.province = "Province is required"
    if (!formData.district) errors.district = "District is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const formDataObj = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataObj.append(key, value.toString())
      }
    })

    // Add files to form data
    files.forEach((file, index) => {
      formDataObj.append(`file-${index}`, file)
    })

    try {
      console.log("Submitting complaint form...")
      const result = await submitComplaint(formDataObj)
      console.log("Submission result:", result)

      if (result.error) {
        toast({
          title: "Submission Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Complaint Submitted Successfully",
          description: `Your tracking ID is ${result.trackingId}. You can use this to check the status of your complaint.`,
        })
        router.push(`/track?id=${result.trackingId}`)
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files)
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      toast({
        title: "Files Added",
        description: `${newFiles.length} file(s) added successfully.`,
      })
    }
  }

  const handleCameraCapture = (e) => {
    const newFiles = Array.from(e.target.files)
    if (newFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      toast({
        title: "Photo Captured",
        description: "Photo added successfully.",
      })
    }
  }

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // For a real app, you would use a reverse geocoding service here
          // For this demo, we'll just set the coordinates as the location
          setFormData((prev) => ({
            ...prev,
            location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }))

          toast({
            title: "Location Found",
            description: "Your current location has been added.",
          })
        } catch (error) {
          console.error("Error getting location details:", error)
          toast({
            title: "Location Error",
            description: "Failed to get location details. Please enter manually.",
            variant: "destructive",
          })
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsGettingLocation(false)

        let errorMessage = "Failed to get your location."
        if (error.code === 1) {
          errorMessage = "Location access denied. Please enable location services."
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please try again or enter manually."
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again."
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
    )
  }

  const selectedCategory = categories.find((cat) => cat.id.toString() === formData.category)
  const subcategories = selectedCategory?.subcategories || []

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Submit a Complaint or Feedback</CardTitle>
          <CardDescription>
            Please provide details about your issue so we can route it to the appropriate department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className={formErrors.category ? "text-destructive" : ""}>
                  Category*
                </Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="category" className={formErrors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-sm text-destructive">{formErrors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => handleSelectChange("subcategory", value)}
                  disabled={!formData.category || subcategories.length === 0}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className={formErrors.title ? "text-destructive" : ""}>
                Title*
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief title of your complaint"
                required
                value={formData.title}
                onChange={handleChange}
                className={formErrors.title ? "border-destructive" : ""}
              />
              {formErrors.title && <p className="text-sm text-destructive">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={formErrors.description ? "text-destructive" : ""}>
                Description*
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please provide detailed information about the issue"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className={formErrors.description ? "border-destructive" : ""}
              />
              {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province" className={formErrors.province ? "text-destructive" : ""}>
                  Province*
                </Label>
                <Select
                  required
                  value={formData.province}
                  onValueChange={(value) => handleSelectChange("province", value)}
                >
                  <SelectTrigger id="province" className={formErrors.province ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {RWANDA_PROVINCES.map((province) => (
                      <SelectItem key={province.name} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.province && <p className="text-sm text-destructive">{formErrors.province}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className={formErrors.district ? "text-destructive" : ""}>
                  District*
                </Label>
                <Select
                  required
                  value={formData.district}
                  onValueChange={(value) => handleSelectChange("district", value)}
                  disabled={!formData.province}
                >
                  <SelectTrigger id="district" className={formErrors.district ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.district && <p className="text-sm text-destructive">{formErrors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector (Optional)</Label>
                <Input
                  id="sector"
                  name="sector"
                  placeholder="Your sector"
                  value={formData.sector}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="location"
                  className={`flex items-center gap-1 ${formErrors.location ? "text-destructive" : ""}`}
                >
                  <MapPin className="h-4 w-4" />
                  Specific Location*
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-1"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Getting location...</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="h-3 w-3" />
                      <span>Use current location</span>
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="location"
                name="location"
                placeholder="Specific address or description of the location"
                required
                value={formData.location}
                onChange={handleChange}
                className={formErrors.location ? "border-destructive" : ""}
              />
              {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                defaultValue="medium"
                name="priority"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">
                    High - Immediate attention required
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">
                    Medium - Needs attention within a week
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal">
                    Low - Can be addressed when resources are available
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Upload Files</p>
                    <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                  />
                </div>
                <div
                  className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Take Photo</p>
                    <p className="text-xs text-gray-500 mt-1">Use your camera to capture the issue</p>
                  </div>
                  <Input
                    ref={cameraInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                  />
                </div>
              </div>

              {/* Display uploaded files */}
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files ({files.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative border rounded-md p-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-xs truncate">{file.name}</span>
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-gray-200 dark:bg-gray-700 p-0.5"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information (Optional)</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="Email or phone number for follow-up"
                value={formData.contact}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => handleCheckboxChange("anonymous", checked)}
                />
                <Label htmlFor="anonymous" className="font-normal text-sm">
                  Submit anonymously (your identity will not be shared with the institution)
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Providing contact information allows us to follow up with you about your complaint.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
