"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import type { Subreddit } from "@/types/subreddit"
import type { RedditPost } from "@/types/reddit-post"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const STORAGE_KEY = 'reddit-analytics-subreddits'

export default function SubredditPage() {
  const searchParams = useSearchParams()
  const subredditName = searchParams.get('name')
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null)
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const { toast } = useToast()
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  // Load subreddit data
  useEffect(() => {
    if (!subredditName) return

    const savedSubreddits = localStorage.getItem(STORAGE_KEY)
    if (savedSubreddits) {
      try {
        const subreddits: Subreddit[] = JSON.parse(savedSubreddits).map((sub: any) => ({
          ...sub,
          createdAt: new Date(sub.createdAt)
        }))
        const found = subreddits.find(sub => sub.name.toLowerCase() === subredditName.toLowerCase())
        setSubreddit(found || null)
      } catch (error) {
        console.error('Error loading subreddit:', error)
      }
    }
    setIsLoading(false)
  }, [subredditName])

  // Fetch posts when subreddit changes
  useEffect(() => {
    if (!subreddit) return

    const fetchPosts = async () => {
      setIsLoadingPosts(true)
      try {
        const response = await fetch(`/api/posts?subreddit=${subreddit.name}`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        // Convert string dates to Date objects
        const postsWithDates = data.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt)
        }))
        setPosts(postsWithDates)
      } catch (error) {
        console.error('Error fetching posts:', error)
        toast({
          title: "Error",
          description: "Failed to fetch posts. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPosts(false)
      }
    }

    fetchPosts()
  }, [subreddit, toast])

  // Sort posts by score in descending order
  const sortedPosts = [...posts].sort((a, b) => b.score - a.score)

  const togglePost = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4" />
          <div className="h-4 w-full max-w-md bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!subreddit) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Subreddit not found</h1>
          <p className="text-muted-foreground">
            The subreddit you're looking for doesn't exist in your list.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">r/{subreddit.name}</h1>
        </div>
        <p className="text-muted-foreground">{subreddit.description}</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <div className="rounded-lg border">
            <div className="p-4">
              {isLoadingPosts ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-4 bg-muted rounded w-3/4" />
                  <div className="animate-pulse h-4 bg-muted rounded w-1/2" />
                  <div className="animate-pulse h-4 bg-muted rounded w-2/3" />
                </div>
              ) : sortedPosts.length > 0 ? (
                <div className="space-y-2">
                  {sortedPosts.map(post => {
                    const isExpanded = expandedPosts.has(post.id)
                    return (
                      <div 
                        key={post.id} 
                        className="rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors"
                      >
                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => togglePost(post.id)}
                        >
                          <h3 className="font-medium">{post.title}</h3>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{post.score} upvotes</span>
                            <span>•</span>
                            <span>{post.numComments} comments</span>
                            <span>•</span>
                            <span>{format(post.createdAt, 'MMM d, h:mm a')}</span>
                          </div>
                          
                          {isExpanded && post.content && (
                            <div 
                              className="mt-3 pt-3 border-t text-sm"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="whitespace-pre-wrap mb-2">
                                {post.content}
                              </div>
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open in Reddit
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No posts found from the past 24 hours.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="themes" className="space-y-4">
          <div className="rounded-lg border">
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Theme categories and their associated posts will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
} 