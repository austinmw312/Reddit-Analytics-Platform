import { Spinner } from "@/components/ui/spinner"

export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Spinner className="text-muted-foreground" size={32} />
    </div>
  )
} 