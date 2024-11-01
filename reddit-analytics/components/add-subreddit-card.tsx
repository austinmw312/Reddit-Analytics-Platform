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
        <Card className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#2e2e2e] transition-colors h-[140px] bg-[#1f1f1f] border-gray-700">
          <Plus className="h-8 w-8 text-gray-200" />
          <CardTitle className="text-gray-200">Add Subreddit</CardTitle>
        </Card>
      </DialogTrigger>
      {children(setOpen)}
    </Dialog>
  )
} 