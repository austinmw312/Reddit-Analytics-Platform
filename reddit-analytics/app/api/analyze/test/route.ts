import { NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { PostCategorySchema } from "@/types/post-category"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Sample post for testing
const TEST_POST = {
  title: "Need advice on switching from software engineering to product management",
  content: `I've been a software engineer for 5 years now, but I'm increasingly interested in product management. 
  I enjoy the technical aspects of my job, but I find myself more drawn to understanding user needs and making product decisions.
  
  Has anyone here made this transition? What steps did you take? Any certifications or courses you'd recommend?
  
  I'm particularly concerned about:
  1. How to gain product experience while still in an engineering role
  2. Whether I need an MBA
  3. How to position my engineering background as an advantage
  
  Any advice would be greatly appreciated!`
}

export async function GET() {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a post categorization assistant. Analyze Reddit posts and categorize them according to the specified categories.",
        },
        {
          role: "user",
          content: `Analyze this Reddit post and categorize it:

Title: ${TEST_POST.title}
Content: ${TEST_POST.content}`,
        },
      ],
      temperature: 0.1,
      response_format: zodResponseFormat(
        PostCategorySchema,
        "post_category_analysis"
      ),
    })

    const result = completion.choices[0].message.parsed
    if (!result) {
      throw new Error("Failed to parse post categorization result")
    }

    // Return both the post and the analysis for better visibility
    return NextResponse.json({
      post: TEST_POST,
      analysis: result,
    })
  } catch (error) {
    console.error("Error in test analysis:", error)
    return NextResponse.json(
      { error: "Failed to analyze test post" },
      { status: 500 }
    )
  }
} 