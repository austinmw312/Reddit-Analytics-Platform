import { z } from "zod"

export const PostCategorySchema = z.object({
  isSolutionRequest: z.boolean().describe("Posts asking for solutions to problems"),
  isPainPoint: z.boolean().describe("Posts expressing pain points or problems related to a product or service"),
  isIdea: z.boolean().describe("Posts introducing new ideas or concepts, including new product or startup ideas"),
  isAdviceRequest: z.boolean().describe("Posts asking for advice"),
  isOther: z.boolean().describe("Only true if post does not fit into any other category"),
})

export type PostCategoryAnalysis = z.infer<typeof PostCategorySchema> 