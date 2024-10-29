import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Subreddit } from "@/types/subreddit"

interface AddSubredditModalProps {
  onSubredditAdded: (subreddit: Subreddit) => void
}

export function AddSubredditModal({ onSubredditAdded }: AddSubredditModalProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Extract subreddit name from URL
      const subredditName = extractSubredditName(url)
      if (!subredditName) {
        throw new Error("Invalid subreddit URL")
      }

      const response = await fetch("/api/subreddits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: subredditName }),
      })

      if (!response.ok) {
        throw new Error("Failed to add subreddit")
      }

      const subreddit = await response.json()

      toast({
        title: "Success",
        description: "Subreddit added successfully",
      })

      setUrl("")
      setOpen(false)
      onSubredditAdded(subreddit)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add subreddit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Subreddit URL</Label>
            <Input
              id="url"
              placeholder="https://reddit.com/r/subredditname"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Subreddit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function extractSubredditName(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    // Find the part after /r/
    const rIndex = pathParts.indexOf('r')
    if (rIndex !== -1 && pathParts[rIndex + 1]) {
      return pathParts[rIndex + 1]
    }
    return null
  } catch {
    return null
  }
} 