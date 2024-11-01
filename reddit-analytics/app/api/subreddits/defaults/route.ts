import { NextResponse } from "next/server"
import Snoowrap from "snoowrap"
import { supabase } from "@/lib/supabaseClient"
import type { Subreddit } from "@/types/subreddit"

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
})

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function GET(request: Request) {
  try {
    // Get the list of subreddits from the query parameter
    const { searchParams } = new URL(request.url)
    const subredditsParam = searchParams.get('subreddits')
    
    if (!subredditsParam) {
      return NextResponse.json({ error: "No subreddits specified" }, { status: 400 })
    }

    const requestedSubreddits = subredditsParam.split(',')

    // First, try to get requested subreddits from Supabase
    const { data: existingSubreddits } = await supabase
      .from('subreddits')
      .select('*')
      .in('name', requestedSubreddits)

    const subredditsToFetch = requestedSubreddits.filter(name => {
      const existingSubreddit = existingSubreddits?.find(s => s.name === name)
      if (!existingSubreddit) return true

      const lastUpdateTime = new Date(existingSubreddit.updated_at).getTime()
      return Date.now() - lastUpdateTime >= CACHE_DURATION
    })

    // Fetch any missing or stale subreddits from Reddit
    const newSubredditsPromises = subredditsToFetch.map(async (name) => {
      const subredditInfo = await reddit.getSubreddit(name).fetch()
      
      const subredditData = {
        name: subredditInfo.display_name.toLowerCase(),
        member_count: subredditInfo.subscribers,
        description: subredditInfo.public_description || subredditInfo.description,
        url: `https://reddit.com/r/${subredditInfo.display_name}`,
        created_at: new Date(),
        updated_at: new Date()
      }

      // Upsert to Supabase
      await supabase
        .from('subreddits')
        .upsert(subredditData, {
          onConflict: 'name'
        })

      return subredditData
    })

    await Promise.all(newSubredditsPromises)

    // Fetch final state of requested subreddits
    const { data: finalSubreddits, error: finalError } = await supabase
      .from('subreddits')
      .select('*')
      .in('name', requestedSubreddits)
      .order('name')

    if (finalError) throw finalError

    const subreddits: Subreddit[] = finalSubreddits.map(s => ({
      id: s.id,
      name: s.name,
      memberCount: s.member_count,
      description: s.description,
      url: s.url,
      createdAt: new Date(s.created_at)
    }))

    return NextResponse.json(subreddits)
  } catch (error) {
    console.error("Error loading subreddits:", error)
    return NextResponse.json(
      { error: "Failed to load subreddits" },
      { status: 500 }
    )
  }
} 