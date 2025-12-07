import type { Metadata } from "next"
import Image from "next/image"
import { Calendar, User, ArrowRight, Search } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { generateSEO } from "../../lib/seo"
import { BlogSearchClient } from "./blog-search"

export const metadata: Metadata = generateSEO({
  title: "Blog - Tech Tips, Reviews & Industry Insights | TechStore",
  description: "Read the latest technology news, product reviews, buying guides, and industry insights on TechStore blog. Get expert tips and stay updated on tech trends.",
  url: "/blog",
  keywords: ["blog", "articles", "tech news", "reviews", "guides", "technology", "insights"],
  type: "article",
})

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Smartphones of 2024: Our Expert Recommendations",
    excerpt: "Discover the best smartphones that dominated the market this year. We've tested and reviewed the top 10 models to help you make the right choice.",
    content: "This comprehensive guide covers the top smartphones of 2024, including detailed specifications, performance analysis, and value for money assessment...",
    author: "Sarah Tech",
    date: "2024-01-15",
    category: "Smartphones",
    image: "/placeholder.svg",
    readTime: "8 min read",
  },
  {
    id: 2,
    title: "Laptop Buying Guide: Everything You Need to Know",
    excerpt: "Confused about which laptop to buy? Our guide covers processors, RAM, storage, and everything else you need to consider.",
    content: "Whether you're a student, professional, or creative, this guide helps you understand the key specs and choose the perfect laptop...",
    author: "John Davis",
    date: "2024-01-12",
    category: "Laptops",
    image: "/placeholder.svg",
    readTime: "10 min read",
  },
  {
    id: 3,
    title: "5G Technology: What It Means for You",
    excerpt: "5G is here! Learn about 5G technology, its benefits, and how it will change mobile communication in Bangladesh.",
    content: "5G is the next generation of mobile network technology. In this article, we explore how 5G works, its benefits, and when you can expect it in Bangladesh...",
    author: "Mike Chen",
    date: "2024-01-10",
    category: "Technology",
    image: "/placeholder.svg",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Tablet vs Laptop: Which Should You Buy?",
    excerpt: "Trying to decide between a tablet and laptop? We compare both to help you make the right choice for your needs.",
    content: "Tablets and laptops serve different purposes. Let's explore the pros and cons of each to help you decide which is right for you...",
    author: "Emma Wilson",
    date: "2024-01-08",
    category: "Comparison",
    image: "/placeholder.svg",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Gaming Laptops Explained: Power Meets Portability",
    excerpt: "Looking for a gaming laptop? Our guide breaks down the key specs you need for smooth gameplay and stunning graphics.",
    content: "Gaming laptops require specific specifications to deliver great performance. Learn about GPUs, refresh rates, cooling, and more...",
    author: "Alex Kumar",
    date: "2024-01-05",
    category: "Gaming",
    image: "/placeholder.svg",
    readTime: "9 min read",
  },
  {
    id: 6,
    title: "Budget Smartphones Under ৳30,000: Best Options",
    excerpt: "Great phones don't have to be expensive. Check our top picks for the best budget smartphones under ৳30,000.",
    content: "If you're on a budget, there are still plenty of great smartphone options. Here are our top recommendations for phones under ৳30,000...",
    author: "Lisa Anderson",
    date: "2024-01-02",
    category: "Smartphones",
    image: "/placeholder.svg",
    readTime: "5 min read",
  },
  {
    id: 7,
    title: "Understanding Warranty: What's Covered and What's Not",
    excerpt: "Confused about warranty coverage? We explain what manufacturer warranty covers and when you might need extended protection.",
    content: "Product warranties can be confusing. Let's break down what's typically covered, what's not, and whether extended warranty is worth it...",
    author: "Tom Brooks",
    date: "2023-12-30",
    category: "Tips",
    image: "/placeholder.svg",
    readTime: "6 min read",
  },
  {
    id: 8,
    title: "The Rise of AI in Smartphones: What to Expect",
    excerpt: "AI is revolutionizing smartphones. Discover how AI-powered features are making phones smarter and more capable.",
    content: "Artificial intelligence is becoming a core part of smartphone technology. In this article, we explore how AI enhances phone capabilities...",
    author: "Sarah Tech",
    date: "2023-12-28",
    category: "Technology",
    image: "/placeholder.svg",
    readTime: "8 min read",
  },
  {
    id: 9,
    title: "How to Take Care of Your Electronics: Maintenance Tips",
    excerpt: "Extend the life of your devices with these essential maintenance tips. Learn how to properly care for your electronics.",
    content: "Regular maintenance can significantly extend the life of your devices. Here are expert tips on how to care for your smartphones, laptops, and tablets...",
    author: "Mike Chen",
    date: "2023-12-25",
    category: "Tips",
    image: "/placeholder.svg",
    readTime: "7 min read",
  },
  {
    id: 10,
    title: "Refurbished Electronics: Quality vs. Cost",
    excerpt: "Are refurbished devices worth buying? We analyze the pros and cons to help you decide if refurbished is right for you.",
    content: "Refurbished electronics can offer great value. Let's explore the benefits and risks of buying refurbished vs. brand new devices...",
    author: "Emma Wilson",
    date: "2023-12-20",
    category: "Comparison",
    image: "/placeholder.svg",
    readTime: "6 min read",
  },
]

const categories = Array.from(new Set(blogPosts.map((post) => post.category))).sort()

export default function BlogPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">TechStore Blog</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Stay informed with the latest technology news, expert reviews, buying guides, and industry insights.
        </p>
      </section>

      {/* Search and Filter */}
      <section>
        <BlogSearchClient posts={blogPosts} categories={categories} />
      </section>

      {/* Featured Post */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted lg:aspect-auto">
          <Image
            src={blogPosts[0].image || "/placeholder.svg"}
            alt={blogPosts[0].title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-muted/50 p-8">
          <div>
            <p className="text-sm font-medium text-primary">{blogPosts[0].category}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{blogPosts[0].title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{blogPosts[0].excerpt}</p>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {blogPosts[0].author}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(blogPosts[0].date).toLocaleDateString()}
            </div>
            <span className="text-sm text-muted-foreground">{blogPosts[0].readTime}</span>
            <a href={`/blog/${blogPosts[0].id}`} className="ml-auto inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Read More
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Recent Articles</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(1, 7).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-col justify-between pt-6 flex-1">
                <div>
                  <p className="text-xs font-medium text-primary">{post.category}</p>
                  <h3 className="mt-2 text-lg font-semibold line-clamp-2">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* All Posts */}
      <section>
        <h2 className="mb-8 text-3xl font-bold tracking-tight">All Articles</h2>
        <div className="space-y-4">
          {blogPosts.slice(7).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-start gap-6">
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary">{post.category}</p>
                  <h3 className="mt-1 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <span>{post.readTime}</span>
                    <a href={`/blog/${post.id}`} className="ml-auto text-primary hover:underline font-medium">
                      Read →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="rounded-2xl bg-primary/5 p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscribe to Our Newsletter</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Get the latest tech news, reviews, and buying guides delivered to your inbox every week.
        </p>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg border border-border bg-background"
            required
          />
          <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}
