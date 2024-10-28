import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for post category analysis
const PostCategorySchema = z.object({
  isSolutionRequest: z.boolean().describe('Posts asking for solutions to problems'),
  isPainPoint: z.boolean().describe('Posts expressing pain points or problems'),
  isIdea: z.boolean().describe('Posts introducing new ideas or concepts, including startup ideas'),
  isAdviceRequest: z.boolean().describe('Posts asking for advice'),
  isOther: z.boolean().describe('Only true if post does not fit into any other category'),
});

// TypeScript type derived from the Zod schema
export type PostCategoryAnalysis = z.infer<typeof PostCategorySchema>;

export interface RedditPostContent {
  title: string;
  content: string;
}

export async function categorizePost(post: RedditPostContent): Promise<PostCategoryAnalysis> {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a post categorization assistant. Analyze Reddit posts and categorize them according to the specified categories."
        },
        {
          role: "user",
          content: `Analyze this Reddit post and categorize it:
          
Title: ${post.title}
Content: ${post.content}`
        }
      ],
      temperature: 0.1,
      response_format: zodResponseFormat(PostCategorySchema, "post_category_analysis"),
    });

    const result = completion.choices[0].message.parsed;
    if (!result) {
      throw new Error('Failed to parse post categorization result');
    }
    
    // If no other categories are true, set isOther to true
    if (!result.isSolutionRequest && 
        !result.isPainPoint && 
        !result.isIdea && 
        !result.isAdviceRequest) {
      result.isOther = true;
    } else {
      result.isOther = false;
    }

    return result;

  } catch (error) {
    console.error('Error categorizing post:', error);
    throw error;
  }
}

