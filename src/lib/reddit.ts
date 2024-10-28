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
