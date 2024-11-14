"use client"

import { useEffect, useState } from "react"
import { AddSubredditModal } from "@/components/add-subreddit-modal"
import { SubredditCard } from "@/components/subreddit-card"
import { AddSubredditCard } from "@/components/add-subreddit-card"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Subreddit } from "@/types/subreddit"
import { getLocalSubreddits, addLocalSubreddit, removeLocalSubreddit } from "@/lib/local-subreddits"
import { LoadingScreen } from "@/components/loading-screen"

export default function Component() {
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
    return <LoadingScreen />
  }
  return (
    <div className="dark min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-relaxed" style={{ color: '#ff4600' }}>Reddit Insights</h1>
          <p className="mt-2 text-xl" style={{ color: '#333333' }}>Fuel startup ideas by identifying pain points, solution requests, and more.</p>
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
            {(setOpen) => (
              <DialogContent className="bg-white border-gray-200 fixed sm:absolute sm:top-1/2 sm:-translate-y-1/2 top-[20%] left-[50%] -translate-x-1/2 max-w-[calc(100vw-2rem)] w-[500px] rounded-lg [&>button]:text-gray-500 [&>button]:hover:text-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#ff4600]">Add New Subreddit</DialogTitle>
                </DialogHeader>
                <AddSubredditModal 
                  onSubredditAdded={handleSubredditAdded} 
                  setOpen={setOpen}
                />
              </DialogContent>
            )}
          </AddSubredditCard>
        </div>
      </main>
    </div>
  )
}