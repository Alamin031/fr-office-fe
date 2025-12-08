"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/app/lib/utils"
import type { Product } from "@/app/types"

interface ProductTabsProps {
  product: Product
}

const faqs = [
  {
    question: "What is the warranty period?",
    answer: "This product comes with 1 year official warranty. You can also add Care+ for extended 2-year coverage.",
  },
  {
    question: "Is this product original?",
    answer: "Yes, all our products are 100% genuine and sourced directly from authorized distributors.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept bKash, Nagad, bank cards, bank transfer, and cash on delivery.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery typically takes 2-5 business days within Bangladesh. Express delivery is available in Dhaka.",
  },
]

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("specifications")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "description", label: "Description" },
    { id: "warranty", label: "Warranty & Support" },
    { id: "faq", label: "FAQ" },
  ]

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 pb-4 px-2 md:px-6 text-sm md:text-base font-medium transition-all duration-200 relative",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground rounded-full mx-2 md:mx-6" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-12 animate-in fade-in-0 duration-300">
        {activeTab === "specifications" && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                      index % 2 === 0 ? "bg-muted/30" : "bg-card",
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-muted-foreground w-1/3 uppercase tracking-wide">{key}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "description" && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <p className="text-base text-muted-foreground leading-relaxed text-justify">{product.description}</p>
            </div>
            {product.highlights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <ul className="grid gap-3">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <div className="h-2 w-2 rounded-full bg-foreground mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "warranty" && (
          <div className="space-y-8 max-w-3xl">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-8 border border-blue-200/20 dark:border-blue-700/20">
              <h3 className="text-lg font-bold mb-3">Warranty Information</h3>
              <p className="text-muted-foreground leading-relaxed">{product.warranty}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border p-6 hover:bg-muted/50 transition-colors">
                <h4 className="font-bold mb-4 text-lg">What's Covered</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Manufacturing defects</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Hardware malfunctions</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Software issues (factory reset)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Battery performance issues</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border p-6 hover:bg-muted/50 transition-colors">
                <h4 className="font-bold mb-4 text-lg">What's Not Covered</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3 items-start">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Physical damage or drops</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Water or liquid damage</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Unauthorized modifications</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>Normal wear and tear</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border transition-all duration-200 hover:border-border/70 hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold hover:bg-muted/50 transition-colors"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-300 text-muted-foreground",
                      openFAQ === index && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFAQ === index ? "max-h-48" : "max-h-0"
                  )}
                >
                  <div className="border-t border-border bg-muted/30 p-6 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
