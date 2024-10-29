import { fetchRecentPosts } from './reddit';
import { categorizePost, PostCategoryAnalysis } from './post-categorizer';

const MAX_POSTS_TO_ANALYZE = 5; // Adjust this number as needed

async function testPostCategorization() {
  try {
    // Fetch posts
    console.log('Fetching posts from r/ollama...');
    const posts = await fetchRecentPosts('ollama');
    const postsToAnalyze = posts.slice(0, MAX_POSTS_TO_ANALYZE);
    
    console.log(`\nFetched ${posts.length} posts. Analyzing first ${MAX_POSTS_TO_ANALYZE}...\n`);
    
    // Analyze each post
    for (const post of postsToAnalyze) {
      console.log(`\nPost: "${post.title}"`);
      console.log('----------------------------------------');
      
      const analysis = await categorizePost({
        title: post.title,
        content: post.content
      });
      
      // Print analysis results as JSON
      console.log('Analysis:', JSON.stringify(analysis, null, 2));
      console.log('----------------------------------------\n');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Starting categorization test...');
testPostCategorization();
