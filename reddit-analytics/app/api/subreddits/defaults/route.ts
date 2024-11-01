import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subreddits = searchParams.get('subreddits')

    if (!subreddits) {
      return NextResponse.json([])
    }

    const subredditNames = subreddits.split(',')

    const { data, error } = await supabase
      .from('subreddits')
      .select('*')
      .in('name', subredditNames)

    if (error) {
      throw error
    }

    return NextResponse.json(data.map(subreddit => ({
      id: subreddit.id,
      name: subreddit.name,
      memberCount: subreddit.member_count,
      description: subreddit.description,
      url: subreddit.url,
      createdAt: new Date(subreddit.created_at)
    })))
  } catch (error) {
    console.error("Error fetching subreddits:", error)
    return NextResponse.json(
      { error: "Failed to fetch subreddits" },
      { status: 500 }
    )
  }
} 