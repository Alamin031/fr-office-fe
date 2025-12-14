import { ArrowRight, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "../ui/card"
import blogsService from "@/app/lib/api/services/blogs"
import { Button } from "../ui/button"

export async function BlogSection() {
  try {
    const postsResponse = await blogsService.getAll()
    const blogPosts = postsResponse.data.slice(0, 4)

    if (!blogPosts.length) {
      return null
    }

    return (
      <section className="py-12 md:py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              Latest from Blog
            </h2>
            <p className="text-muted-foreground">
              Expert reviews, guides, and technology insights
            </p>
          </div>
          <a href="/blog">
            <Button 
              variant="outline" 
              className="hidden sm:flex items-center gap-2 rounded-lg"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post) => (
            <a 
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group h-full"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border-border/50 hover:border-emerald-300 dark:hover:border-emerald-700">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <CardContent className="flex flex-col flex-1 pt-4 pb-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold line-clamp-2 text-foreground group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                    {post.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                    {post.readTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 sm:hidden">
          <a href="/blog" className="block">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full rounded-lg flex items-center justify-center gap-2"
            >
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return null
  }
}
