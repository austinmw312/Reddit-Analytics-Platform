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
      <div className="space-y-2">
        <div className="flex">
          <div className="flex items-center bg-gray-100 px-3 border border-r-0 border-gray-200 rounded-l-md text-gray-600">
            r/
          </div>
          <Input
            id="subredditName"
            className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-gray-200 text-gray-900"
            placeholder="subreddit name"
            value={subredditName}
            onChange={(e) => setSubredditName(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-[#ff4600] hover:bg-[#ff5722] text-white" 
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Subreddit"}
      </Button>
    </form>
  )
}