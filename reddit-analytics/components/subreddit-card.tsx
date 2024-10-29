import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Link from "next/link"
import type { Subreddit } from "@/types/subreddit"

interface SubredditCardProps {
  subreddit: Subreddit
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  return (
    <Link href={`/${subreddit.name}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>r/{subreddit.name}</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {subreddit.memberCount.toLocaleString()}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {subreddit.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
} 