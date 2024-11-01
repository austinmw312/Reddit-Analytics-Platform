import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ThemeCategory } from "@/types/theme"

interface ThemeCardProps {
  theme: ThemeCategory
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {theme.name}
          <span className="text-sm font-normal text-muted-foreground">
            {theme.posts.length} posts
          </span>
        </CardTitle>
        <CardDescription>{theme.description}</CardDescription>
      </CardHeader>
    </Card>
  )
} 