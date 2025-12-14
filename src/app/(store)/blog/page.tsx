"use client";
import { Card, CardContent } from "@/app/components/ui/card"
import blogsService, { BlogPost } from "@/app/lib/api/services/blogs"
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react" // removed Mail
import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/app/components/ui/badge"
import Link from "next/link"

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const postsResponse = await blogsService.getAll()
        const postsWithId = postsResponse.data.map((post: BlogPost) => ({
          ...post,
          id: typeof post.id === "string"
            ? post.id
            : post.id !== undefined
              ? String(post.id)
              : "",
        }))
        setBlogPosts(postsWithId)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        setBlogPosts([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  if (!blogPosts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No blog posts found yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Check back soon for exciting content!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#f5f7fa] via-[#eef2f7] to-[#e7edf5] dark:from-[#0b1220] dark:via-[#0e1626] dark:to-[#101a2b] py-16 md:py-24 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25px 25px, rgba(0,0,0,0.5) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="inline-block mb-4">
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 bg-white/70 dark:bg-white/10 text-[#1f3b64] dark:text-[#bcd0ff] border-[#cbd5e1] dark:border-white/20 shadow-sm"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Technology Insights
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1f2937] dark:text-white mb-6">
            Friends Telecom Blog
          </h1>
          <p className="text-lg md:text-xl text-[#4b5563] dark:text-[#9aa7b5] max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest technology news, expert reviews, comprehensive buying guides, and industry insights from our team of specialists.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <section>
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              All Articles
            </h2>
            <p className="text-muted-foreground">Browse our complete collection</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                aria-label={`Read: ${post.title}`}
                className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Card className="overflow-hidden transition-all duration-300 flex flex-col h-full border border-[#e5e7eb] dark:border-white/10 bg-background hover:shadow-md hover:scale-[1.01]">
                  <div className="relative aspect-[16/10] bg-muted">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {post.readTime && (
                      <span className="absolute bottom-2 left-2 text-[11px] px-2 py-0.5 rounded-full bg-background/85 backdrop-blur border border-[#e5e7eb] dark:border-white/20 text-muted-foreground">
                        {post.readTime}
                      </span>
                    )}
                  </div>

                  <CardContent className="flex flex-col flex-1 gap-3 pt-5 pb-5">
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full px-2.5 py-0.5 bg-muted text-foreground/80 border-border"
                    >
                      Article
                    </Badge>

                    <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pb-4 border-t border-[#eef2f7] dark:border-white/10 pt-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt || "").toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) || "Invalid Date"}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors text-sm font-medium">
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
