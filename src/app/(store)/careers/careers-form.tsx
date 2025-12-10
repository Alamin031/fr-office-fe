"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

const positions = [
  "Senior Software Engineer",
  "Customer Success Manager",
  "Marketing Executive",
  "UI/UX Designer",
  "Logistics Coordinator",
  "Product Manager",
]

export function CareersForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    coverLetter: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePositionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, position: value }))
  }

  const handleExperienceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experience: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.phone || !formData.position || !formData.experience) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSubmitSuccess(true)

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        coverLetter: "",
      })

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {submitSuccess ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <div className="mb-3 text-4xl">✓</div>
            <h3 className="font-semibold text-green-900">Application Received!</h3>
            <p className="mt-2 text-sm text-green-800">
              Thank you for applying to TechStore. We&apos;ll review your application and get back to you within 5-7 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-2"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-2"
                placeholder="+880 1234567890"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="position">Position Applying For *</Label>
                <Select value={formData.position} onValueChange={handlePositionChange}>
                  <SelectTrigger id="position" className="mt-2">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience *</Label>
                <Select value={formData.experience} onValueChange={handleExperienceChange}>
                  <SelectTrigger id="experience" className="mt-2">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                className="mt-2 min-h-32"
                placeholder="Tell us why you'd be a great fit for this position..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.coverLetter.length}/2000
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                * Required fields. By submitting this form, you agree to be contacted by TechStore regarding your application.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
