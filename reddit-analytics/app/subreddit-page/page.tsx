"use client"

import React, { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink, ArrowUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import type { Subreddit } from "@/types/subreddit"
import type { RedditPost } from "@/types/reddit-post"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { analyzePosts } from "@/lib/analyze-posts"
import type { PostCategoryAnalysis } from "@/types/post-category"
import type { ThemeCategory } from "@/types/theme"
import { ThemeCard } from "@/components/theme-card"
import { CategoryLabel } from "@/components/category-label"
import { getLocalSubreddits } from "@/lib/local-subreddits"
import { LoadingScreen } from "@/components/loading-screen"
import { Progress } from "@/components/ui/progress"

function SubredditPageContent() {
  const searchParams = useSearchParams()
  const subredditName = searchParams.get('name')
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null)
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const { toast } = useToast()
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [postAnalysis, setPostAnalysis] = useState<Map<string, PostCategoryAnalysis>>(new Map())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  // Load subreddit data
  useEffect(() => {
    if (!subredditName) return

    // Fetch the subreddit data from the API
    const fetchSubreddit = async () => {
      try {
        const localSubreddits = getLocalSubreddits()
        if (!localSubreddits.includes(subredditName.toLowerCase())) {
          setSubreddit(null)
          return
        }

        const response = await fetch(`/api/subreddits/defaults?subreddits=${subredditName}`)
        if (!response.ok) throw new Error("Failed to fetch subreddit")
        
        const subreddits = await response.json()
        if (subreddits.length > 0) {
          setSubreddit(subreddits[0])
        } else {
          setSubreddit(null)
        }
      } catch (error) {
        console.error('Error loading subreddit:', error)
        setSubreddit(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubreddit()
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
        const postsWithDates = data.map((post: RedditPost) => ({
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

  // Add new useEffect for post analysis
  useEffect(() => {
    if (!posts.length) return

    const analyzeAllPosts = async () => {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      try {
        const totalPosts = posts.length
        const analysis = new Map<string, PostCategoryAnalysis>()
        let highestProgress = 0
        
        // Analyze posts in batches of 5 to show progress
        for (let i = 0; i < posts.length; i += 5) {
          const batch = posts.slice(i, i + 5)
          const batchAnalysis = await analyzePosts(batch)
          
          // Merge batch results into main analysis map
          batchAnalysis.forEach((value, key) => {
            analysis.set(key, value)
          })
          
          // Update progress, but never decrease it
          const currentProgress = Math.min(((i + batch.length) / totalPosts) * 100, 100)
          highestProgress = Math.max(highestProgress, currentProgress)
          setAnalysisProgress(highestProgress)
        }
        
        setPostAnalysis(analysis)
      } catch (error) {
        console.error('Error analyzing posts:', error)
        toast({
          title: "Error",
          description: "Failed to analyze posts. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
        setAnalysisProgress(100)
      }
    }

    analyzeAllPosts()
  }, [posts, toast])

  // Function to organize posts into themes
  const getThemeCategories = (): ThemeCategory[] => {
    const themes: ThemeCategory[] = [
      {
        name: "Solution Requests",
        description: "Posts asking for solutions to problems",
        posts: [],
      },
      {
        name: "Pain Points",
        description: "Posts expressing pain points related to a product or service",
        posts: [],
      },
      {
        name: "New Ideas",
        description: "Posts introducing new business ideas or concepts",
        posts: [],
      },
      {
        name: "Advice Requests",
        description: "Posts asking for advice",
        posts: [],
      },
      {
        name: "Other",
        description: "Posts that don't fit into other categories",
        posts: [],
      },
    ]

    // Categorize each post
    posts.forEach(post => {
      const analysis = postAnalysis.get(post.id)
      if (!analysis) return

      if (analysis.isSolutionRequest) themes[0].posts.push(post)
      if (analysis.isPainPoint) themes[1].posts.push(post)
      if (analysis.isIdea) themes[2].posts.push(post)
      if (analysis.isAdviceRequest) themes[3].posts.push(post)
      if (analysis.isOther) themes[4].posts.push(post)
    })

    // Sort posts within each theme by score
    themes.forEach(theme => {
      theme.posts.sort((a, b) => b.score - a.score)
    })

    // Only return themes that have posts
    return themes.filter(theme => theme.posts.length > 0)
  }

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

  const renderPosts = (postsToRender: RedditPost[]) => {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-2">
          {postsToRender.map(post => {
            const isExpanded = expandedPosts.has(post.id)
            const analysis = postAnalysis.get(post.id)
            
            return (
              <div 
                key={post.id} 
                className="rounded-lg border-transparent border hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => togglePost(post.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <div className="text-sm text-gray-600 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          {post.score}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.numComments}
                        </span>
                        <span>{format(post.createdAt, 'MMM d')}</span>
                      </div>
                    </div>
                    
                    {analysis && (
                      <div className="flex flex-wrap gap-1 items-start mt-1 justify-end">
                        {analysis.isSolutionRequest && <CategoryLabel category="solution" />}
                        {analysis.isPainPoint && <CategoryLabel category="pain" />}
                        {analysis.isIdea && <CategoryLabel category="idea" />}
                        {analysis.isAdviceRequest && <CategoryLabel category="advice" />}
                        {analysis.isOther && <CategoryLabel category="other" />}
                      </div>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div 
                      className="mt-3 pt-3 border-t border-gray-200 text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      {post.content && (
                        <div className="whitespace-pre-wrap mb-2 text-gray-600">
                          {post.content}
                        </div>
                      )}
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
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
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!subreddit) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Subreddit not found</h1>
          <p className="text-muted-foreground">
            The subreddit you&apos;re looking for doesn&apos;t exist in your list.
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
    <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#ff4600]">r/{subreddit.name}</h1>
        </div>
        <p className="text-gray-600">{subreddit.description}</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-gray-100 text-gray-600">
          <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Top Posts from Past 24 Hours
          </TabsTrigger>
          <TabsTrigger value="themes" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            Themes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Analyzing posts...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress 
                value={analysisProgress} 
                className="bg-gray-100 [&>div]:bg-[#ff4600]"
              />
            </div>
          )}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="p-4">
              {isLoadingPosts ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-4 bg-gray-100 rounded w-3/4" />
                  <div className="animate-pulse h-4 bg-gray-100 rounded w-1/2" />
                  <div className="animate-pulse h-4 bg-gray-100 rounded w-2/3" />
                </div>
              ) : sortedPosts.length > 0 ? (
                <div className="space-y-2">
                  {renderPosts(sortedPosts)}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No posts found from the past 24 hours.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="themes" className="space-y-8">
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Analyzing posts...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress 
                value={analysisProgress} 
                className="bg-gray-100 [&>div]:bg-[#ff4600]"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getThemeCategories().map(theme => (
              <div 
                key={theme.name}
                onClick={() => setSelectedTheme(theme.name)}
                className="cursor-pointer"
              >
                <ThemeCard theme={theme} />
              </div>
            ))}
          </div>
          
          {selectedTheme && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#ff4600]">{selectedTheme}</h2>
              {renderPosts(getThemeCategories().find(t => t.name === selectedTheme)?.posts || [])}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

export default function SubredditPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="bg-white min-h-screen">
        <SubredditPageContent />
      </div>
    </Suspense>
  )
} 