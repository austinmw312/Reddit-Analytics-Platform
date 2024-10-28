import { fetchRecentPosts } from './reddit';  // Remove the .js extension

async function testRedditFetch() {
  try {
    console.log('Fetching posts from r/ollama...');
    const posts = await fetchRecentPosts('ollama');
    
    console.log(`\nFetched ${posts.length} posts from the last 24 hours:\n`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   Upvotes: ${post.score}`);
      console.log(`   Comments: ${post.numComments}`);
      console.log(`   Posted: ${post.createdAt}`);
      console.log(`   URL: ${post.url}`);
      if (post.content) {
        console.log(`   Content:\n   ${post.content.split('\n').join('\n   ')}`);
      }
      console.log('---');
    });

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRedditFetch();
