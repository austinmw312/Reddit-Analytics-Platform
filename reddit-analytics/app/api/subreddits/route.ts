import { NextResponse } from "next/server"
import Snoowrap from "snoowrap"
import type { Subreddit } from "@/types/subreddit"
import { supabase } from "@/lib/supabaseClient"

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
})

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const subredditName = name.toLowerCase()

    // Check if subreddit exists in Supabase and is fresh
    const { data: existingSubreddit, error: fetchError } = await supabase
      .from('subreddits')
      .select('*')
      .eq('name', subredditName)
      .single()

    // If we found the subreddit and it's fresh, return it
    if (existingSubreddit && !fetchError) {
      const lastUpdateTime = new Date(existingSubreddit.updated_at).getTime()
      const isFresh = Date.now() - lastUpdateTime < CACHE_DURATION

      if (isFresh) {
        return NextResponse.json({
          id: existingSubreddit.id,
          name: existingSubreddit.name,
          memberCount: existingSubreddit.member_count,
          description: existingSubreddit.description,
          url: existingSubreddit.url,
          createdAt: new Date(existingSubreddit.created_at)
        })
      }
    }

    // If not found or stale, fetch from Reddit
    const subredditInfo = await reddit.getSubreddit(subredditName).fetch()

    // Transform the data
    const subredditData = {
      name: subredditInfo.display_name.toLowerCase(),
      member_count: subredditInfo.subscribers,
      description: subredditInfo.public_description || subredditInfo.description,
      url: `https://reddit.com/r/${subredditInfo.display_name}`,
      created_at: new Date(),
      updated_at: new Date()
    }

    // Upsert the data to Supabase
    const { data: savedSubreddit, error: upsertError } = await supabase
      .from('subreddits')
      .upsert(subredditData, {
        onConflict: 'name',
        returning: 'minimal'
      })

    if (upsertError) {
      console.error("Error upserting to Supabase:", upsertError)
      throw upsertError
    }

    // Fetch the saved data to get the UUID
    const { data: newSubreddit, error: getError } = await supabase
      .from('subreddits')
      .select('*')
      .eq('name', subredditName)
      .single()

    if (getError) {
      console.error("Error fetching saved subreddit:", getError)
      throw getError
    }

    // Return the data in the format expected by the frontend
    const subreddit: Subreddit = {
      id: newSubreddit.id,
      name: newSubreddit.name,
      memberCount: newSubreddit.member_count,
      description: newSubreddit.description,
      url: newSubreddit.url,
      createdAt: new Date(newSubreddit.created_at)
    }

    return NextResponse.json(subreddit)
  } catch (error) {
    console.error("Error adding subreddit:", error)
    return NextResponse.json(
      { error: "Failed to add subreddit" },
      { status: 500 }
    )
  }
} 