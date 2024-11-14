import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ThemeCategory } from "@/types/theme"
import { FileText } from "lucide-react"

interface ThemeCardProps {
  theme: ThemeCategory
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card className="hover:bg-gray-50 transition-colors cursor-pointer bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#ff4600]">{theme.name}</CardTitle>
          <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
            <FileText className="h-3 w-3" />
            {theme.posts.length} posts
          </div>
        </div>
        <CardDescription className="text-gray-600">
          {theme.description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
} 