import type { RedditPost } from "@/types/reddit-post"
import type { PostCategoryAnalysis } from "@/types/post-category"

export async function analyzePosts(posts: RedditPost[]): Promise<Map<string, PostCategoryAnalysis>> {
  const results = new Map<string, PostCategoryAnalysis>()

  // Analyze posts concurrently in batches of 5 to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize)
    const promises = batch.map(async (post) => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze post")
        }

        const analysis = await response.json()
        results.set(post.id, analysis)
      } catch (error) {
        console.error(`Error analyzing post ${post.id}:`, error)
      }
    })

    await Promise.all(promises)
  }

  return results
} 