import { cn } from "@/lib/utils"

interface CategoryLabelProps {
  category: 'solution' | 'pain' | 'idea' | 'advice' | 'other'
}

export function CategoryLabel({ category }: CategoryLabelProps) {
  const styles = {
    solution: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    pain: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    idea: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    advice: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  }

  const labels = {
    solution: "Solution Request",
    pain: "Pain Point",
    idea: "New Idea",
    advice: "Advice Request",
    other: "Other",
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      styles[category]
    )}>
      {labels[category]}
    </span>
  )
} 