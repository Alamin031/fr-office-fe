import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with customer support.",
}

const contactInfo = [
  { icon: Phone, title: "Phone", content: "+880 1343-159931", subtext: "Support 24/7" },
  { icon: Mail, title: "Email", content: "help.frtel@gmail.com", subtext: "We reply within 24 hours" },
  { icon: MapPin, title: "Address", content: "Bashundhara City Shopping Complex Basement 2, Shop 25", subtext: "Dhaka, Bangladesh" },
  { icon: Clock, title: "Working Hours", content: "6days: 9AM - 9PM", subtext: "Tuesday closed" },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-muted-foreground">
          We’re here to help. Choose a channel below or send us a message.
        </p>
      </div>

      {/* Form: top center */}
      <div className="mx-auto mb-12 w-full max-w-2xl">
        <Card className="border border-border/60 bg-background">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <MessageSquare className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Send us a message</h2>
                <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
              </div>
            </div>

            <form className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+880 1234-567890" className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Related</SelectItem>
                    <SelectItem value="product">Product Inquiry</SelectItem>
                    <SelectItem value="return">Return/Refund</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help you?" rows={5} required className="bg-background" />
                <p className="text-xs text-muted-foreground">By submitting, you agree to our privacy policy.</p>
              </div>

              <Button type="submit" className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Contact summary cards: below the form */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {contactInfo.map((info) => (
          <Card
            key={info.title}
            className="border border-[#e5e7eb] dark:border-white/10 bg-background transition-all hover:shadow-md hover:-translate-y-0.5 rounded-2xl"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <info.icon className="h-6 w-6 text-foreground" />
                </div>

                {/* Text block */}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">
                    {info.title}
                  </h3>
                  <p className="mt-1 text-base font-semibold text-foreground leading-snug">
                    {info.content}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {info.subtext}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optional corporate info: keep at the end, full width */}
      <div className="mt-12">
        <Card className="border border-border/60 bg-background">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground">Corporate Support</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For partnerships, enterprise quotes, or media inquiries, please use the form and select “Other” as the subject.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Response time: within 1 business day</li>
              <li>• Hours: Sun–Thu, 9:00 AM–6:00 PM</li>
              <li>• Offices: Dhaka, Bangladesh</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
