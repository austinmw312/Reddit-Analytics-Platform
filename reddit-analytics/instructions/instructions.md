# Reddit Analytics Platform - Product Requirements Document

## Project Overview

You are building a Reddit analytics platform where users can view analytics on different subreddits. The platform allows users to see top posts and categorize each post into specific themes. The application utilizes the Reddit API to fetch data and employs technologies like Next.js, Shadcn UI, Tailwind CSS, Lucide Icons, and Supabase for the backend.

## Core Functionalities

### 1. Subreddit Management

#### 1.1 View Available Subreddits

**Description**: Users can see a list of subreddits that have already been added to the platform.

**Display**: Each subreddit is displayed in a card format containing:

- Title: The name of the subreddit
- Number of Members: Total subscribers of the subreddit
- Description: A brief description of the subreddit

#### 1.2 Add New Subreddit

**Action**: Users can click on an "Add Subreddit" button.

**Process**:

- Opens a modal where users can input the Reddit URL of the subreddit they wish to add
- Upon clicking "Add", the subreddit is saved to the database

**Result**: The page refreshes to display the new subreddit in the list.

### 2. Subreddit Detail Page

#### 2.1 Navigation

**Access**: Clicking on a subreddit card redirects the user to the subreddit's detail page.

#### 2.2 Tabs

- Top Posts: Displays the top posts from the subreddit
- Themes: Shows categorized themes derived from the subreddit posts

### 3. Top Posts Tab

#### 3.1 Fetch Reddit Posts

**Data Source**: Uses the Reddit API via Snoowrap to fetch posts from the past 24 hours.
**Storage**: Retrieved posts are stored in Supabase for persistence.

#### 3.2 Display Posts

**Information Displayed**:

- Title: The title of the post
- Number of Upvotes: The score or upvotes the post has received
- Content: The body or self-text of the post
- Created UTC: The timestamp of when the post was created
- Number of Comments: Total comments on the post
- URL: Direct link to the post on Reddit

**Layout**: Posts are displayed in a table component, sorted by the number of upvotes in descending order.

### 4. Themes Tab

#### 4.1 Post Analysis

**Objective**: Analyze each post to categorize it into predefined themes using the OpenAI API.

**Categories**:

- Solution Requests: Posts asking for solutions to problems
- Pain Points: Posts expressing pain points or problems
- Ideas: Posts introducing new ideas or concepts, such as new products, services, or startup ideas
- Advice Requests: Posts asking for advice on topics
- Other: Posts that don't fit into the other categories

#### 4.2 Concurrent Processing

**Requirement**: The analysis process should run concurrently for all posts to optimize performance.

#### 4.3 Display Themes

**Information Displayed**:

- Category Name: The name of the theme category
- Number of Posts: Total posts that fall under the category
- Interaction: Clicking on a category card opens a side panel displaying all posts belonging to that category

### 5. Manage Categories

#### 5.1 Add New Category

**Action**: Users can add new theme categories.

**Process**:

- Opens a modal with a form to input the category name and description
- Upon adding, the theme analysis process re-runs to include the new category

## File Structure

```
reddit-analytics
├── README.md
├── app
│   ├── api
│   │   ├── analyze
│   │   ├── posts
│   │   └── subreddits
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── subreddit-page
│       ├── not-found.tsx
│       └── page.tsx
├── components
│   ├── add-subreddit-modal.tsx
│   ├── category-label.tsx
│   ├── subreddit-card.tsx
│   └── theme-card.tsx
├── components.json
├── hooks
│   └── use-toast.ts
├── instructions
│   └── instructions.md
├── lib
│   ├── analyze-posts.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── types
    ├── post-category.ts
    ├── reddit-post.ts
    ├── subreddit.ts
    └── theme.ts
```

**Notes**:

- Components within Pages: Components specific to a page are defined within that page's file to reduce the number of files
- API Routes: Separated into fetchPosts.ts and analyzePosts.ts for clarity and separation of concerns
- Lib Directory: Contains client initializations for external services

## Documentation

### 1. Fetching Reddit Posts with Snoowrap

To retrieve Reddit posts from the past 24 hours, we use the Snoowrap library.

**Code Example**:

```typescript
import * as dotenv from "dotenv";
import Snoowrap from "snoowrap";

// Load environment variables
dotenv.config();

// Interface for the post data we want to store
interface RedditPost {
  id: string;
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
}

// Initialize the Snoowrap client using password authentication
const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || "",
  clientId: process.env.REDDIT_CLIENT_ID || "",
  clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
  username: process.env.REDDIT_USERNAME || "",
  password: process.env.REDDIT_PASSWORD || "",
});

export async function fetchRecentPosts(
  subredditName: string
): Promise<RedditPost[]> {
  try {
    // Get the subreddit
    const subreddit = reddit.getSubreddit(subredditName);

    // Calculate timestamp for 24 hours ago
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    // Fetch new posts from the last 24 hours
    const posts = await subreddit.getNew({
      limit: 100, // Adjust this number based on your needs
    });

    // Filter and map the posts
    const recentPosts = posts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        id: post.id,
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000),
        url: post.url,
      }));

    return recentPosts;
  } catch (error) {
    console.error("Error fetching reddit posts:", error);
    throw error;
  }
}
```

**Explanation**:

- Environment Variables: Used for authentication with Reddit API
- RedditPost Interface: Defines the structure of the post data
- fetchRecentPosts Function:
  - Retrieves posts from a specific subreddit
  - Filters posts from the past 24 hours
  - Maps the posts to the RedditPost interface

### 2. Analyzing Reddit Posts with OpenAI API

To categorize Reddit posts into themes, we use the OpenAI API with a structured output format.

**Code Example**:

```typescript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for post category analysis
const PostCategorySchema = z.object({
  isSolutionRequest: z
    .boolean()
    .describe("Posts asking for solutions to problems"),
  isPainPoint: z.boolean().describe("Posts expressing pain points or problems"),
  isIdea: z
    .boolean()
    .describe(
      "Posts introducing new ideas or concepts, including startup ideas"
    ),
  isAdviceRequest: z.boolean().describe("Posts asking for advice"),
  isOther: z
    .boolean()
    .describe("Only true if post does not fit into any other category"),
});

// TypeScript type derived from the Zod schema
export type PostCategoryAnalysis = z.infer<typeof PostCategorySchema>;

export interface RedditPostContent {
  title: string;
  content: string;
}

export async function categorizePost(
  post: RedditPostContent
): Promise<PostCategoryAnalysis> {
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

Title: ${post.title}
Content: ${post.content}`,
        },
      ],
      temperature: 0.1,
      response_format: zodResponseFormat(
        PostCategorySchema,
        "post_category_analysis"
      ),
    });

    const result = completion.choices[0].message.parsed;
    if (!result) {
      throw new Error("Failed to parse post categorization result");
    }

    // If no other categories are true, set isOther to true
    if (
      !result.isSolutionRequest &&
      !result.isPainPoint &&
      !result.isIdea &&
      !result.isAdviceRequest
    ) {
      result.isOther = true;
    } else {
      result.isOther = false;
    }

    return result;
  } catch (error) {
    console.error("Error categorizing post:", error);
    throw error;
  }
}
```

**Example Output**:

```json
{
  "isSolutionRequest": true,
  "isPainPoint": false,
  "isIdea": false,
  "isAdviceRequest": true,
  "isOther": false
}
```

## Development Guidelines

### Concurrency

- Ensure that the analysis of posts runs concurrently to optimize performance and reduce waiting times

### Error Handling

- Implement robust error handling for API calls to Reddit and OpenAI to manage rate limits and unexpected responses

### Data Storage

- Use Supabase for storing subreddit information, posts, and analysis results

### UI Components

- Utilize Shadcn UI components and Tailwind CSS for styling
- Use Lucide Icons for consistent iconography

## User Interface Details

### Home Page (app/page.tsx)

#### Subreddit List

- Displayed as cards in a grid layout
- Each card shows the title, number of members, and description
- Clicking a card navigates to the subreddit detail page

#### Add Subreddit Modal

- Contains a form field to input the Reddit URL
- Has an "Add" button to submit the form
- Validates the input to ensure it's a valid Reddit URL

### Subreddit Detail Page (app/[subreddit]/page.tsx)

#### Tabs

- Implement tabs for "Top Posts" and "Themes"
- Highlight the active tab

#### Top Posts Tab

- Displays posts in a sortable table
- Columns include title, upvotes, content preview, created date, comments count, and link to the Reddit post

#### Themes Tab

- Displays theme categories as cards
- Each card shows the category name and the number of posts
- Clicking a card opens a side panel with a list of posts under that category

#### Add New Category

- An "Add Category" button opens a modal
- The modal contains fields for category name and description
- Upon submission, the new category is added, and the analysis re-runs

## Technical Requirements

- Next.js: Use Next.js for server-side rendering and API routes
- Supabase: Utilize Supabase for database services
- Snoowrap: Employ Snoowrap for interacting with the Reddit API
- OpenAI API: Use the OpenAI API for natural language processing and post categorization
- Shadcn UI and Tailwind CSS: For UI components and styling
- Lucide Icons: For icons throughout the application
- TypeScript: Ensure all code is written in TypeScript for type safety

## Environment Variables

Ensure the following environment variables are set:

### Reddit API Credentials

- REDDIT_USER_AGENT
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- REDDIT_USERNAME
- REDDIT_PASSWORD

### OpenAI API Key

- OPENAI_API_KEY

### Supabase Credentials

- SUPABASE_URL
- SUPABASE_ANON_KEY

## Dependencies

- Snoowrap: For Reddit API interactions
- OpenAI: For accessing OpenAI's API
- Zod: For schema validation
- Supabase: For database and backend services
- Shadcn UI: For pre-built UI components
- Tailwind CSS: For utility-first CSS styling
- Lucide Icons: For iconography

## Expected Outcomes

1. Functional Reddit Analytics Platform: Users can add subreddits, view top posts, and analyze themes
2. Efficient Data Handling: Posts are fetched and analyzed efficiently, with data stored in Supabase
3. User-Friendly Interface: The application is intuitive, with clear navigation and interactive elements
4. Extensibility: The platform allows for adding new categories and scaling to include more subreddits

## Testing and Validation

- Unit Testing: Implement unit tests for critical functions, especially API interactions
- Integration Testing: Test the flow between fetching posts, storing them, and analyzing themes
- User Acceptance Testing: Ensure the application meets the user requirements and is intuitive to use
- Performance Testing: Verify that concurrent processing of posts does not degrade performance

## Deployment Considerations

- Environment Configuration: Ensure all environment variables are securely managed in production
- Scalability: Prepare the application to handle increased load as more subreddits and users are added
- Monitoring: Set up logging and monitoring to track application performance and errors

## Conclusion

This PRD outlines the essential features and technical requirements for the Reddit analytics platform. By adhering to this document, developers will have a clear understanding of the project's scope, functionality, and implementation details, ensuring alignment throughout the development process.
