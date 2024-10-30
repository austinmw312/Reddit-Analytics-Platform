import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ExternalLink } from "lucide-react"
import { format } from "date-fns"
import type { ThemeCategory } from "@/types/theme"

interface ThemeCardProps {
  theme: ThemeCategory
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{theme.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {theme.posts.length} posts
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{theme.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {theme.posts.map(post => (
            <div key={post.id} className="space-y-2 pb-4 border-b last:border-0">
              <h3 className="font-medium">{post.title}</h3>
              {post.content && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.content}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{post.score} upvotes</span>
                  <span>•</span>
                  <span>{post.numComments} comments</span>
                  <span>•</span>
                  <span>{format(post.createdAt, 'MMM d, h:mm a')}</span>
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
} 