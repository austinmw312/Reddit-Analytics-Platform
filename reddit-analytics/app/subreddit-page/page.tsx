"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Subreddit } from "@/types/subreddit"

const STORAGE_KEY = 'reddit-analytics-subreddits'

export default function SubredditPage() {
  const searchParams = useSearchParams()
  const subredditName = searchParams.get('name')
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!subredditName) return

    // Get subreddit from localStorage
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

      {/* Tabs will be added here in the next step */}
    </main>
  )
} 