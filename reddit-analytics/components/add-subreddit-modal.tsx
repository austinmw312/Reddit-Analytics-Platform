import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Subreddit } from "@/types/subreddit"

interface AddSubredditModalProps {
  onSubredditAdded: (subreddit: Subreddit) => void
  setOpen: (open: boolean) => void
}

export function AddSubredditModal({ onSubredditAdded, setOpen }: AddSubredditModalProps) {
  const [subredditName, setSubredditName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/subreddits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: subredditName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add subreddit")
      }

      toast({
        title: "Success",
        description: "Subreddit added successfully",
      })

      setSubredditName("")
      onSubredditAdded(data)
      setOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add subreddit"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex">
            <div className="flex items-center bg-[#1a1a1a] px-3 border border-r-0 border-gray-700 rounded-l-md text-gray-300">
              r/
            </div>
            <Input
              id="subredditName"
              className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1a1a1a] border-gray-700 text-gray-100"
              placeholder="subreddit name"
              value={subredditName}
              onChange={(e) => setSubredditName(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-[#f56565]">{error}</p>
          )}
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-gray-100" 
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Subreddit"}
      </Button>
    </form>
  )
}