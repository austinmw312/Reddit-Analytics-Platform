import { NextResponse } from "next/server"
import Snoowrap from "snoowrap"
import type { RedditPost } from "@/types/reddit-post"

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
})

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

    // Get the subreddit
    const subreddit = reddit.getSubreddit(subredditName)

    // Calculate timestamp for 24 hours ago
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60

    // Fetch new posts from the last 24 hours
    const posts = await subreddit.getNew({
      limit: 100, // Adjust this number based on your needs
    })

    // Filter and map the posts
    const recentPosts: RedditPost[] = posts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        id: post.id,
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000),
        url: post.url,
      }))

    return NextResponse.json(recentPosts)
  } catch (error) {
    console.error("Error fetching reddit posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
} 