import { Plus } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

interface AddSubredditCardProps {
  children: React.ReactNode // This will be the modal content
}

export function AddSubredditCard({ children }: AddSubredditCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent transition-colors h-[140px]">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="text-lg font-medium text-muted-foreground">Add Subreddit</span>
        </Card>
      </DialogTrigger>
      {children}
    </Dialog>
  )
} 