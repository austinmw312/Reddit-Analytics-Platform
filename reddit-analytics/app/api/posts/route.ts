import { NextResponse } from "next/server"
import Snoowrap from "snoowrap"
import type { RedditPost } from "@/types/reddit-post"
import { supabase } from "@/lib/supabaseClient"

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
    const { searchParams } = new URL(request.url)
    const subredditName = searchParams.get('subreddit')

    if (!subredditName) {
      return NextResponse.json(
        { error: "Subreddit name is required" },
        { status: 400 }
      )
    }

    // First, get the subreddit ID from our subreddits table
    const { data: subredditData, error: subredditError } = await supabase
      .from('subreddits')
      .select('id')
      .eq('name', subredditName)
      .single()

    if (subredditError || !subredditData) {
      throw new Error("Subreddit not found in database")
    }
    // Check for cached posts in Supabase
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('subreddit_id', subredditData.id)
      .order('score', { ascending: false })

    // Calculate timestamp for 24 hours ago
    const oneDayAgo = new Date(Date.now() - CACHE_DURATION)

    // If we have posts and they're fresh, return them
    if (existingPosts && existingPosts.length > 0) {
      const retrievedAt = new Date(existingPosts[0].retrieved_at)
      if (retrievedAt > oneDayAgo) {
        return NextResponse.json(existingPosts.map(post => ({
          id: post.reddit_id,
          title: post.title,
          content: post.content,
          score: post.score,
          numComments: post.num_comments,
          createdAt: new Date(post.created_at),
          url: post.url
        })))
      }
    }

    // If no posts or they're stale, fetch from Reddit
    const subreddit = reddit.getSubreddit(subredditName)
    const redditPosts = await subreddit.getNew({
      limit: 100,
    })

    // Filter for posts from the last 24 hours
    const recentPosts = redditPosts
      .filter((post) => post.created_utc > (Date.now() / 1000) - 24 * 60 * 60)
      .map((post) => ({
        reddit_id: post.id,
        subreddit_id: subredditData.id,
        title: post.title,
        content: post.selftext,
        score: post.score,
        num_comments: post.num_comments,
        created_at: new Date(post.created_utc * 1000),
        retrieved_at: new Date(),
        url: post.url,
      }))

    // Delete old posts for this subreddit
    await supabase
      .from('posts')
      .delete()
      .eq('subreddit_id', subredditData.id)

    // Insert new posts
    if (recentPosts.length > 0) {
      const { error: insertError } = await supabase
        .from('posts')
        .insert(recentPosts)

      if (insertError) {
        throw insertError
      }
    }

    // Return posts in the format expected by the frontend
    const posts: RedditPost[] = recentPosts.map(post => ({
      id: post.reddit_id,
      title: post.title,
      content: post.content,
      score: post.score,
      numComments: post.num_comments,
      createdAt: new Date(post.created_at),
      url: post.url
    }))

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching reddit posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
} 