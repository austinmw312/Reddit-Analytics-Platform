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
      console.log(`\nAnalyzing post: "${post.title}"`);
      console.log('----------------------------------------');
      
      const analysis = await categorizePost({
        title: post.title,
        content: post.content
      });
      
      // Print post details
      console.log('Post Content:');
      console.log(`Title: ${post.title}`);
      if (post.content) {
        console.log(`Content: ${post.content.slice(0, 200)}${post.content.length > 200 ? '...' : ''}`);
      }
      
      // Print analysis results
      console.log('\nCategory Analysis:');
      Object.entries(analysis).forEach(([category, value]) => {
        if (value === true) {
          console.log(`✓ ${formatCategoryName(category)}`);
        }
      });
      
      console.log('\nMetrics:');
      console.log(`Upvotes: ${post.score}`);
      console.log(`Comments: ${post.numComments}`);
      console.log(`URL: ${post.url}`);
      console.log('----------------------------------------\n');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Helper function to format category names
function formatCategoryName(category: string): string {
  switch (category) {
    case 'isSolutionRequest':
      return 'Solution Request';
    case 'isPainPoint':
      return 'Pain Point';
    case 'isIdea':
      return 'Idea';
    case 'isAdviceRequest':
      return 'Advice Request';
    case 'isOther':
      return 'Other';
    default:
      return category;
  }
}

// Run the test
console.log('Starting categorization test...');
testPostCategorization();
