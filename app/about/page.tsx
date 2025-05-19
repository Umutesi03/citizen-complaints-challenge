import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About CitizenConnect</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="lead">
            CitizenConnect is Rwanda's official platform for citizen engagement with government services and
            institutions. Our mission is to bridge the gap between citizens and government, making public service
            delivery more efficient, transparent, and responsive.
          </p>

          <h2>Our Vision</h2>
          <p>
            A Rwanda where every citizen can easily communicate with government institutions, report issues, and receive
            timely responses and solutions.
          </p>

          <h2>How CitizenConnect Works</h2>
          <p>
            CitizenConnect provides a simple, accessible way for citizens to submit complaints, provide feedback, and
            track the status of their submissions. The platform routes each submission to the appropriate government
            institution based on the nature and location of the issue.
          </p>

          <h3>Key Features:</h3>
          <ul>
            <li>Easy submission of complaints and feedback</li>
            <li>Real-time tracking of submission status</li>
            <li>Direct communication with relevant government institutions</li>
            <li>Transparent reporting on resolution times and satisfaction rates</li>
            <li>Available in Kinyarwanda, English, and French</li>
          </ul>

          <h2>Government Institutions</h2>
          <p>
            CitizenConnect works with national ministries, provincial administrations, district offices, and specialized
            agencies across Rwanda to ensure that citizen concerns are addressed by the appropriate authorities.
          </p>

          <h2>Privacy and Security</h2>
          <p>
            We take the privacy and security of citizen data seriously. All submissions are protected with
            industry-standard security measures, and citizens can choose to submit anonymously if they prefer.
          </p>

          <h2>Contact Us</h2>
          <p>For assistance with using CitizenConnect, please contact our support team:</p>
          <ul>
            <li>Email: support@citizenconnect.gov.rw</li>
            <li>Phone: +250 788 123 456</li>
            <li>Office: City Hall, Nyarugenge, Kigali</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
