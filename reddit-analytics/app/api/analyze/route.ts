import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"
import { PostCategorySchema } from "@/types/post-category"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: "Post title is required" },
        { status: 400 }
      )
    }

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

Title: ${title}
Content: ${content || '[No content]'}`,
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

    // If no other categories are true, set isOther to true
    if (
      !result.isSolutionRequest &&
      !result.isPainPoint &&
      !result.isIdea &&
      !result.isAdviceRequest
    ) {
      result.isOther = true
    } else {
      result.isOther = false
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing post:", error)
    return NextResponse.json(
      { error: "Failed to analyze post" },
      { status: 500 }
    )
  }
} 