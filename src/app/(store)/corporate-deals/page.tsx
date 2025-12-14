'use client'

import { CheckCircle2, Award, Users, Zap, Shield, Handshake, ArrowRight, Phone, Mail } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function CorporateDealsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50 dark:from-emerald-950/30 dark:via-background dark:to-blue-950/30">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Corporate Deals & Partnerships</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Premium solutions designed for businesses and organizations seeking quality and reliability
          </p>
        </div>

        {/* Benefits Grid */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Why Partner With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Award className="h-8 w-8 text-emerald-600 shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">Certified Quality</h3>
                  <p className="text-muted-foreground">100% genuine products with official warranty and after-sales support</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow">
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

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow">
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

            <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-background/60 p-6 hover:shadow-lg transition-shadow">
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
        <section className="mb-12 md:mb-16 bg-white/40 dark:bg-background/40 rounded-2xl border border-border/30 p-8 md:p-12">
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
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Corporate Services</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Bulk Order Management</p>
                <p className="text-muted-foreground mt-1">Handle large orders with streamlined procurement and delivery</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Custom Solutions</p>
                <p className="text-muted-foreground mt-1">Tailored packages based on your organization's specific requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-foreground text-lg">Extended Warranty Options</p>
                <p className="text-muted-foreground mt-1">Premium protection plans available for corporate equipment</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
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

        {/* Partnerships Section */}
        <section className="mb-12 md:mb-16 bg-white/40 dark:bg-background/40 rounded-2xl border border-border/30 p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Trusted By Leading Organizations</h2>
          <p className="text-muted-foreground mb-8">We partner with major corporations, educational institutions, and government organizations across Bangladesh and the region</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Banking Sector", "Tech Companies", "Education", "Healthcare", "Government", "Manufacturing", "Retail", "Media"].map((sector) => (
              <div key={sector} className="px-4 py-3 rounded-lg bg-muted/50 border border-border/30 text-center hover:bg-muted transition-colors">
                <p className="text-sm font-medium text-foreground">{sector}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Why Choose Tech Store for Corporate Needs?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6">
              <h3 className="font-bold text-foreground mb-3 text-lg">Cost Efficiency</h3>
              <p className="text-muted-foreground text-sm">Save up to 30% on bulk purchases with volume discounts and special corporate pricing</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6">
              <h3 className="font-bold text-foreground mb-3 text-lg">Time Savings</h3>
              <p className="text-muted-foreground text-sm">Streamlined ordering process and faster delivery for organizations with multiple locations</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-white/60 dark:bg-background/60 p-6">
              <h3 className="font-bold text-foreground mb-3 text-lg">Peace of Mind</h3>
              <p className="text-muted-foreground text-sm">Guaranteed authenticity, comprehensive warranty, and priority after-sales service</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12 md:mb-16">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-600/20 dark:to-blue-600/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 p-8 md:p-12 text-center">
            <Handshake className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to Work Together?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Contact our corporate team to discuss your organization's needs and get a customized quotation</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-12 px-6"
                onClick={() => window.location.href = 'mailto:corporate@techstore.com'}>
                <Mail className="h-5 w-5 mr-2" />
                <span>Contact Us via Email</span>
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 px-6"
                onClick={() => window.location.href = 'tel:+880123456789'}>
                <Phone className="h-5 w-5 mr-2" />
                <span>Call Us Now</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Info Card */}
        <section className="rounded-2xl border border-border/30 bg-white/60 dark:bg-background/60 p-8 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <a href="mailto:corporate@techstore.com" className="font-semibold text-foreground hover:text-emerald-600 transition-colors">
                corporate@techstore.com
              </a>
            </div>
            <div>
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <a href="tel:+880123456789" className="font-semibold text-foreground hover:text-blue-600 transition-colors">
                +880-1234-567890
              </a>
            </div>
            <div>
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Business Hours</p>
              <p className="font-semibold text-foreground">Mon-Fri, 9 AM - 6 PM</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>📍 Corporate Sales Office: Dhaka, Bangladesh</p>
          </div>
        </section>
      </div>
    </div>
  )
}
