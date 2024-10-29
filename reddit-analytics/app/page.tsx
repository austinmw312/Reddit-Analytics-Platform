"use client"

import { useState, useEffect } from "react"
import { SubredditCard } from "@/components/subreddit-card"
import { AddSubredditModal } from "@/components/add-subreddit-modal"
import type { Subreddit } from "@/types/subreddit"
import { useToast } from "@/hooks/use-toast"

const STORAGE_KEY = 'reddit-analytics-subreddits'

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const { toast } = useToast()

  // Load subreddits from localStorage on initial render
  useEffect(() => {
    const savedSubreddits = localStorage.getItem(STORAGE_KEY)
    if (savedSubreddits) {
      try {
        const parsed = JSON.parse(savedSubreddits)
        // Convert string dates back to Date objects
        const subredditsWithDates = parsed.map((sub: any) => ({
          ...sub,
          createdAt: new Date(sub.createdAt)
        }))
        setSubreddits(subredditsWithDates)
      } catch (error) {
        console.error('Error loading subreddits from localStorage:', error)
      }
    }
  }, [])

  const handleSubredditAdded = (newSubreddit: Subreddit) => {
    const updatedSubreddits = [newSubreddit, ...subreddits]
    setSubreddits(updatedSubreddits)
    // Save to localStorage whenever we add a new subreddit
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubreddits))
  }

  const handleSubredditRemove = (id: string) => {
    const updatedSubreddits = subreddits.filter(sub => sub.id !== id)
    setSubreddits(updatedSubreddits)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubreddits))
    
    toast({
      title: "Subreddit removed",
      description: "The subreddit has been removed from your list",
    })
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Reddit Analytics Platform</h1>
        <AddSubredditModal onSubredditAdded={handleSubredditAdded} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard 
            key={subreddit.id} 
            subreddit={subreddit} 
            onRemove={handleSubredditRemove}
          />
        ))}
      </div>
    </main>
  )
}
