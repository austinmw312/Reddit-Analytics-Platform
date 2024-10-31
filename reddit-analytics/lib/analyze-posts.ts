import type { RedditPost } from "@/types/reddit-post"
import type { PostCategoryAnalysis } from "@/types/post-category"
import { supabase } from "@/lib/supabaseClient"

export async function analyzePosts(posts: RedditPost[]): Promise<Map<string, PostCategoryAnalysis>> {
  const analysis = new Map<string, PostCategoryAnalysis>()
  
  try {
    // First, check which posts already have analysis in Supabase
    const { data: existingAnalyses } = await supabase
      .from('post_analysis')
      .select('*')
      .in('reddit_id', posts.map(p => p.id))

    // Create a map of existing analyses
    const existingAnalysisMap = new Map<string, PostCategoryAnalysis>()
    existingAnalyses?.forEach(a => {
      existingAnalysisMap.set(a.reddit_id, {
        isSolutionRequest: a.is_solution_request,
        isPainPoint: a.is_pain_point,
        isIdea: a.is_idea,
        isAdviceRequest: a.is_advice_request,
        isOther: a.is_other
      })
    })

    // Filter out posts that already have analysis
    const postsToAnalyze = posts.filter(post => !existingAnalysisMap.has(post.id))

    // Add existing analyses to our result map
    existingAnalysisMap.forEach((value, key) => {
      analysis.set(key, value)
    })

    // If all posts have been analyzed, return early
    if (postsToAnalyze.length === 0) {
      return analysis
    }

    // Analyze posts that don't have existing analysis
    const analysisPromises = postsToAnalyze.map(async (post) => {
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

        const result: PostCategoryAnalysis = await response.json()
        
        // Store the analysis in Supabase
        const { error: insertError } = await supabase
          .from('post_analysis')
          .insert({
            reddit_id: post.id,
            is_solution_request: result.isSolutionRequest,
            is_pain_point: result.isPainPoint,
            is_idea: result.isIdea,
            is_advice_request: result.isAdviceRequest,
            is_other: result.isOther,
            analyzed_at: new Date()
          })

        if (insertError) {
          console.error(`Error storing analysis for post ${post.id}:`, insertError)
        }

        analysis.set(post.id, result)
      } catch (error) {
        console.error(`Error analyzing post ${post.id}:`, error)
      }
    })

    await Promise.all(analysisPromises)
  } catch (error) {
    console.error('Error in analyzePosts:', error)
  }

  return analysis
} 