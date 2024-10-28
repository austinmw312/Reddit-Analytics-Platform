# Project Overview

You are building a Reddit analytics platform, where users can see analytics on different subreddits. They can see top posts and categories of each post.

You will be using the Reddit API to get the data.

You will be using Next.js, Shadcn UI, Tailwind CSS, Lucid icon, and Supabase.

# Core functionalities

1. See list of available subreddits and add new subreddits.

   1. Users can see the list of available subreddits that have already been added. They will be displayed in cards with the following information: Title, Number of members, and description.
   2. Users can click on the "Add Subreddit" button to add a new subreddit. This will open a modal where they can paste in the reddit URL and click "Add".
   3. After adding a subreddit, the page will automatically refresh to show the new subreddit card in the list.

2. Subreddit page

   1. Clicking on a subreddit card will take the user to the subreddit page.
   2. The page will have 2 tabs: "Top Posts" and "Themes".
   3. "Top Posts" will show the top posts of the subreddit. They will be displayed in cards with the following information: Title, Number of upvotes, content, created_utc, number of comments, and URL.
   4. "Themes" will show the themes of the subreddit. They will be displayed in cards with the following categories: Solution Requests, Pain Points, Ideas, Advice Requests, and Other.

3. Fetch reddit posts data in "Top Posts" tab

   1. The data will be fetched from the Reddit API.
   2. Under "Top Posts", we want to display fetched reddit posts from past 24 hours.
   3. We will use snoowrap to fetch the data.
   4. We will use supabase to store the data.
   5. Each post will have the following information: Title, Number of upvotes, content, created_utc, number of comments, and URL.
   6. Display the posts in a table component sorting by number of upvotes in descending order.

4. Analyze reddit posts data in "Themes" tab

   1. For each post, we should send post data to OpenAI API to analyze the post and categorize it according to the themes.
   2. We will use the following categories: Solution Requests, Pain Points, Ideas, Advice Requests, and Other.
      1. Solution Requests: Posts asking for solutions to problems.
      2. Pain Points: Posts expressing pain points or problems.
      3. Ideas: Posts introducing new ideas or concepts, such as new products, services, or startup ideas.
      4. Advice Requests: Posts asking for advice on topics.
      5. Other: Posts that don't fit into the other categories.
   3. This process needs to be ran concurrently for all posts.
   4. In the "Themes" tab, display each category as a card with the following information: Category name, number of posts.
   5. If the user clicks on a category card, it should open a side panel that shows all the posts belonging to that category.

5. Ability to add new category cards
   1. Users should be able to add new category cards to the "Themes" tab.
   2. This will open a modal with a form that allows users to enter the category name and description.
   3. After adding a category, it should trigger the theme analysis process again.

# Documentation

- [Snoowrap](https://github.com/not-an-aardvark/snoowrap)
- [OpenAI](https://platform.openai.com/docs/api-reference/chat/create)
- [Supabase](https://supabase.com/docs)

## Documentation of how to use Snoowrap to fetch reddit posts data:

CODE EXAMPLE:

```
import * as dotenv from 'dotenv';
import Snoowrap from 'snoowrap';

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
  userAgent: process.env.REDDIT_USER_AGENT || '',
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  username: process.env.REDDIT_USERNAME || '',
  password: process.env.REDDIT_PASSWORD || ''
});

export async function fetchRecentPosts(subredditName: string): Promise<RedditPost[]> {
  try {
    // Get the subreddit
    const subreddit = reddit.getSubreddit(subredditName);

    // Calculate timestamp for 24 hours ago
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    // Fetch new posts from the last 24 hours
    const posts = await subreddit.getNew({
      limit: 100 // Adjust this number based on your needs
    });

    // Filter and map the posts
    const recentPosts = posts
      .filter(post => post.created_utc > oneDayAgo)
      .map(post => ({
        id: post.id,
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdAt: new Date(post.created_utc * 1000),
        url: post.url
      }));

    return recentPosts;

  } catch (error) {
    console.error('Error fetching reddit posts:', error);
    throw error;
  }
}
```

# Current File Structure
