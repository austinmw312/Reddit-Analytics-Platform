"use client"

import { useEffect, useState } from "react"
import { AddSubredditModal } from "@/components/add-subreddit-modal"
import { SubredditCard } from "@/components/subreddit-card"
import { AddSubredditCard } from "@/components/add-subreddit-card"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Subreddit } from "@/types/subreddit"
import { getLocalSubreddits, addLocalSubreddit, removeLocalSubreddit } from "@/lib/local-subreddits"

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubreddits = async () => {
      try {
        const localSubreddits = getLocalSubreddits()
        const response = await fetch(`/api/subreddits/defaults?subreddits=${localSubreddits.join(',')}`)
        if (!response.ok) throw new Error("Failed to load subreddits")
        const data: Subreddit[] = await response.json()
        
        const sortedSubreddits = localSubreddits
          .map(name => data.find(s => s.name === name))
          .filter((s): s is Subreddit => s !== undefined)
        
        setSubreddits(sortedSubreddits)
      } catch (error) {
        console.error("Error loading subreddits:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSubreddits()
  }, [])

  const handleSubredditAdded = (newSubreddit: Subreddit) => {
    addLocalSubreddit(newSubreddit.name)
    setSubreddits(prev => [...prev, newSubreddit])
  }

  if (loading) {
    return <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Loading...</div>
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Reddit Market Insights</h1>
        <p className="text-gray-600 mt-2">Choose a subreddit to identify solution requests, pain points, and more.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subreddits.map((subreddit) => (
          <SubredditCard 
            key={subreddit.id} 
            subreddit={subreddit} 
            onRemove={() => {
              removeLocalSubreddit(subreddit.name)
              setSubreddits(prev => prev.filter(s => s.id !== subreddit.id))
            }}
          />
        ))}
        <AddSubredditCard>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subreddit</DialogTitle>
            </DialogHeader>
            <AddSubredditModal onSubredditAdded={handleSubredditAdded} />
          </DialogContent>
        </AddSubredditCard>
      </div>
    </main>
  )
}
