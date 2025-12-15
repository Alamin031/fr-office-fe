'use client'

import { useState } from 'react'
import corporateDealService from '@/app/lib/api/services/corporate'
import { CheckCircle2, Award, Users, Zap, Shield, Handshake, Phone, Mail } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function CorporateDealsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await corporateDealService.create({
        fullName: formData.fullName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      })
      setSubmitSuccess(true)
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        message: '',
      })
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Corporate Deals & Partnerships</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Premium solutions designed for businesses and organizations seeking quality and reliability
          </p>
        </div>

        {/* Quotation Form Section (Top) */}
        <section className="mb-10 md:mb-14">
          <div className="rounded-2xl border border-border bg-white dark:bg-background p-6 md:p-8 shadow-lg md:shadow-xl md:translate-x-1 ring-1 ring-border/50">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Get a Customized Quote for Your Business</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-foreground mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 flex-col sm:flex-row pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black hover:bg-black/80 text-white rounded-lg h-12 px-6 flex-1 font-semibold shadow">
                  {isSubmitting ? 'Sending...' : submitSuccess ? 'Request Sent!' : 'Send Request'}
                </Button>
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-border shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    ✓ Quote request sent successfully! We&apos;ll contact you within 24 hours.
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Why Partner With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow shadow-sm">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Award className="h-8 w-8 text-black shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">Certified Quality</h3>
                  <p className="text-muted-foreground">100% genuine products with official warranty and after-sales support</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow shadow-sm">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Zap className="h-8 w-8 text-blue-600 shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">Bulk Discounts</h3>
                  <p className="text-muted-foreground">Competitive wholesale pricing for large orders and corporate purchases</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow shadow-sm">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Users className="h-8 w-8 text-purple-600 shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">Dedicated Support</h3>
                  <p className="text-muted-foreground">24/7 customer service and dedicated account managers for corporate clients</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow shadow-sm">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Shield className="h-8 w-8 text-orange-600 shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">Secure Transactions</h3>
                  <p className="text-muted-foreground">Flexible payment terms and secure invoicing for organizations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Stats */}
        <section className="mb-10 md:mb-14 bg-white/60 dark:bg-background/40 rounded-2xl border border-border p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Our Track Record</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-muted-foreground">Corporate Partners</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">15+</div>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
          </div>
        </section>

        {/* Key Services */}
        <section className="mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Corporate Services</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Bulk Order Management</p>
                <p className="text-muted-foreground mt-1">Handle large orders with streamlined procurement and delivery</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Custom Solutions</p>
                <p className="text-muted-foreground mt-1">Tailored packages based on your organization&lsquo;s specific requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Extended Warranty Options</p>
                <p className="text-muted-foreground mt-1">Premium protection plans available for corporate equipment</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-black shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Flexible Payment Terms</p>
                <p className="text-muted-foreground mt-1">Multiple payment options including EMI, invoicing, and corporate credit</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">On-site Support</p>
                <p className="text-muted-foreground mt-1">Technical support and maintenance services at your location</p>
              </div>
            </div>
          </div>
        </section>

        

        {/* Why Choose Us */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Why Choose Tech Store for Corporate Needs?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 text-lg">Cost Efficiency</h3>
              <p className="text-muted-foreground text-sm">Save up to 30% on bulk purchases with volume discounts and special corporate pricing</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 text-lg">Time Savings</h3>
              <p className="text-muted-foreground text-sm">Streamlined ordering process and faster delivery for organizations with multiple locations</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 text-lg">Peace of Mind</h3>
              <p className="text-muted-foreground text-sm">Guaranteed authenticity, comprehensive warranty, and priority after-sales service</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-10 md:mb-14">
          <div className="bg-gradient-to-r from-black/5 to-blue-500/10 dark:from-white/10 dark:to-blue-600/20 rounded-2xl border border-border p-8 md:p-12 text-center shadow-sm">
            <Handshake className="h-12 w-12 text-black mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to Work Together?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Contact our corporate team to discuss your organization&apos;s needs and get a customized quotation</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-12 px-6"
                onClick={() => window.location.href = 'mailto:help.frtel@gmail.com'}>
                <Mail className="h-5 w-5 mr-2" />
                <span>Contact Us via Email</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 px-6"
                onClick={() => window.location.href = 'tel:+8801343159931'}>
                <Phone className="h-5 w-5 mr-2" />
                <span>Call Us Now</span>
              </Button>
            </div>
          </div>
        </section>


        
      </div>
    </div>
  )
}
