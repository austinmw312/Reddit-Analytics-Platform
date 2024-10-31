import { Plus } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface AddSubredditCardProps {
  children: (setOpen: (open: boolean) => void) => React.ReactNode // Modified to pass setOpen
}

export function AddSubredditCard({ children }: AddSubredditCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent transition-colors h-[140px]">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="text-lg font-medium text-muted-foreground">Add Subreddit</span>
        </Card>
      </DialogTrigger>
      {children(setOpen)}
    </Dialog>
  )
} 