import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer group bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-[#ff4600]">r/{subreddit.name}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <Users className="h-3 w-3" />
                  {formattedMemberCount}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-gray-600">
            {subreddit.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}