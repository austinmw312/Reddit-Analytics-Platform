import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ThemeCategory } from "@/types/theme"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ThemeCardProps {
  theme: ThemeCategory
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card className="hover:bg-[#1f1f1f] transition-colors cursor-pointer bg-[#1a1a1a] border-[#2e2e2e]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-200">{theme.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 bg-[#2a2a2a] text-gray-200">
            <FileText className="h-3 w-3" />
            {theme.posts.length} posts
          </Badge>
        </div>
        <CardDescription className="text-gray-200">
          {theme.description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
} 