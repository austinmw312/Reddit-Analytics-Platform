import { NextResponse } from "next/server"
import Snoowrap from "snoowrap"

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
})

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    // Fetch subreddit info from Reddit
    const subredditInfo = await reddit.getSubreddit(name).fetch()

    // Transform the data to match our Subreddit type
    const subreddit = {
      id: subredditInfo.name, // This is the full name (e.g., "t5_2qh33")
      name: subredditInfo.display_name.toLowerCase(),
      memberCount: subredditInfo.subscribers,
      description: subredditInfo.public_description || subredditInfo.description,
      url: `https://reddit.com/r/${subredditInfo.display_name}`,
      createdAt: new Date(subredditInfo.created_utc * 1000)
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