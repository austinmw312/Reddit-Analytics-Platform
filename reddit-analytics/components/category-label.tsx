import { Badge } from "@/components/ui/badge"

type CategoryType = "solution" | "pain" | "idea" | "advice" | "other"

interface CategoryLabelProps {
  category: CategoryType
}

export function CategoryLabel({ category }: CategoryLabelProps) {
  const getColorClasses = (category: CategoryType) => {
    switch (category) {
      case "solution":
        return "bg-[#4299e1] text-white hover:bg-[#4299e1]" // Lighter blue
      case "pain":
        return "bg-[#fc8181] text-white hover:bg-[#fc8181]" // Lighter red
      case "idea":
        return "bg-[#48bb78] text-white hover:bg-[#48bb78]" // Lighter green
      case "advice":
        return "bg-[#9f7aea] text-white hover:bg-[#9f7aea]" // Lighter purple
      case "other":
        return "bg-[#718096] text-white hover:bg-[#718096]" // Lighter gray
      default:
        return "bg-gray-400 text-white hover:bg-gray-400"
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
      className={`${getColorClasses(category)} border-none font-medium cursor-default`}
    >
      {getLabel(category)}
    </Badge>
  )
} 