import { Plus } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface AddSubredditCardProps {
  children: (setOpen: (open: boolean) => void) => React.ReactNode
}

export function AddSubredditCard({ children }: AddSubredditCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors h-[140px] bg-white border-gray-200">
          <Plus className="h-8 w-8 text-gray-600" />
          <CardTitle className="text-gray-600">Add Subreddit</CardTitle>
        </Card>
      </DialogTrigger>
      {children(setOpen)}
    </Dialog>
  )
} 