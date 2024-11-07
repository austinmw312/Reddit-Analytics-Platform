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
    e.preventDefault()
    onRemove(subreddit.id)
  }

  const formattedMemberCount = (subreddit.memberCount ?? 0).toLocaleString()

  return (
    <Link href={`/subreddit-page?name=${encodeURIComponent(subreddit.name)}`}>
      <Card className="hover:bg-[#2e2e2e] transition-colors cursor-pointer group bg-[#1f1f1f] border-[#2e2e2e]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-[#BB86FC]">r/{subreddit.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 bg-[#2a2a2a] text-gray-200">
                  <Users className="h-3 w-3" />
                  {formattedMemberCount}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-300 hover:text-gray-100 hover:bg-[#2a2a2a]"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-gray-200">
            {subreddit.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}