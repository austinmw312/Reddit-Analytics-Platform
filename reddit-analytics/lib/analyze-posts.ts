import type { RedditPost } from "@/types/reddit-post"
import type { PostCategoryAnalysis } from "@/types/post-category"

export async function analyzePosts(posts: RedditPost[]): Promise<Map<string, PostCategoryAnalysis>> {
  const analysis = new Map<string, PostCategoryAnalysis>()
  
  // Analyze each post in the batch
  const analysisPromises = posts.map(async (post) => {
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

      const result = await response.json()
      analysis.set(post.id, result)
    } catch (error) {
      console.error(`Error analyzing post ${post.id}:`, error)
    }
  })

  await Promise.all(analysisPromises)
  return analysis
} 