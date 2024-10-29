import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, X } from "lucide-react"
import Link from "next/link"
import type { Subreddit } from "@/types/subreddit"
import { Button } from "@/components/ui/button"

interface SubredditCardProps {
  subreddit: Subreddit
  onRemove: (id: string) => void
}

export function SubredditCard({ subreddit, onRemove }: SubredditCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent the Link navigation
    onRemove(subreddit.id)
  }

  return (
    <Link href={`/subreddit-page?name=${encodeURIComponent(subreddit.name)}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle>r/{subreddit.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {subreddit.memberCount.toLocaleString()}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {subreddit.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
} 