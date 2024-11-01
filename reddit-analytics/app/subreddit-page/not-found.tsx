import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">404 - Subreddit Not Found</h1>
        <p className="text-muted-foreground">
          The subreddit you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
} 