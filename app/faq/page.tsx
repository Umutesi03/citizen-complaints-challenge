import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I submit a complaint?</AccordionTrigger>
            <AccordionContent>
              To submit a complaint, click on the "Submit a Complaint" button on the homepage or navigate to the Submit
              page. Fill out the form with details about your issue, including the category, location, and description.
              You can also upload photos or documents to support your complaint. Once submitted, you'll receive a
              tracking ID.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How can I track the status of my complaint?</AccordionTrigger>
            <AccordionContent>
              You can track your complaint by clicking on "Track Your Complaint" on the homepage or navigating to the
              Track page. Enter the tracking ID you received when you submitted your complaint. You'll be able to see
              the current status, any updates, and communications from the responsible institution.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Which government institutions are connected to CitizenConnect?</AccordionTrigger>
            <AccordionContent>
              CitizenConnect is integrated with all major government institutions in Rwanda, including national
              ministries, provincial administrations, district offices, and specialized agencies like WASAC, REG, and
              RNP. Your complaint will be automatically routed to the appropriate institution based on its category and
              location.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I submit a complaint anonymously?</AccordionTrigger>
            <AccordionContent>
              Yes, you can choose to submit your complaint anonymously. When filling out the submission form, check the
              "Submit anonymously" option. Please note that while your identity will not be shared with the institution,
              providing contact information allows us to follow up with you about your complaint if necessary.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How long will it take for my complaint to be resolved?</AccordionTrigger>
            <AccordionContent>
              Resolution times vary depending on the nature and complexity of the issue. Simple matters may be resolved
              within days, while more complex issues might take several weeks. You can always check the current status
              of your complaint using your tracking ID. Each institution has performance targets for resolution times
              that they strive to meet.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>What if I'm not satisfied with the resolution?</AccordionTrigger>
            <AccordionContent>
              If you're not satisfied with the resolution of your complaint, you can respond through the platform to
              request further action. If the issue persists, you can escalate your complaint by contacting our support
              team or submitting a new complaint with reference to the original tracking ID.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
            <AccordionContent>
              Yes, we take data security very seriously. All personal information is encrypted and stored securely. We
              comply with Rwanda's data protection regulations and only share your information with the relevant
              government institution handling your complaint. You can also choose to submit anonymously if you prefer.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Can I submit a complaint on behalf of someone else?</AccordionTrigger>
            <AccordionContent>
              Yes, you can submit a complaint on behalf of someone else, such as a family member or neighbor. Please
              indicate this in your submission and provide your relationship to the affected person. If you're
              submitting for a community issue, you can note that it affects multiple citizens.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>What types of issues can I report through CitizenConnect?</AccordionTrigger>
            <AccordionContent>
              You can report a wide range of issues related to public services, including but not limited to:
              infrastructure problems (roads, bridges), utility issues (water, electricity), sanitation concerns, public
              safety matters, transportation issues, health and education services, land and housing matters, and
              environmental concerns.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>Is CitizenConnect available in multiple languages?</AccordionTrigger>
            <AccordionContent>
              Yes, CitizenConnect is available in Kinyarwanda, English, and French to serve all citizens of Rwanda. You
              can change your language preference using the language selector in the website footer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
