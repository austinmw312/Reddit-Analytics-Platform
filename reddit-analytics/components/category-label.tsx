import { Badge } from "@/components/ui/badge"

type CategoryType = "solution" | "pain" | "idea" | "advice" | "other"

interface CategoryLabelProps {
  category: CategoryType
}

export function CategoryLabel({ category }: CategoryLabelProps) {
  const getColorClasses = (category: CategoryType) => {
    switch (category) {
      case "solution":
        return "bg-[#2b6cb0] text-gray-100" // Darker blue
      case "pain":
        return "bg-[#f56565] text-gray-100" // Keeping your specified red
      case "idea":
        return "bg-[#2f855a] text-gray-100" // Darker green
      case "advice":
        return "bg-[#6b46c1] text-gray-100" // Darker purple
      case "other":
        return "bg-[#4a5568] text-gray-100" // Darker gray
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getLabel = (category: CategoryType) => {
    switch (category) {
      case "solution":
        return "Solution Request"
      case "pain":
        return "Pain Point"
      case "idea":
        return "Idea"
      case "advice":
        return "Advice Request"
      case "other":
        return "Other"
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${getColorClasses(category)} border-none font-medium`}
    >
      {getLabel(category)}
    </Badge>
  )
} 