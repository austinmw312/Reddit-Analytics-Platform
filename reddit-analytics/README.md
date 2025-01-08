# Reddit Analytics Platform

An AI-powered analytics platform that provides insights into subreddit discussions by automatically categorizing posts into themes using OpenAI. Built with Next.js, Supabase, and Shadcn UI.

View the deployed project here: [Reddit Analytics Platform](https://reddit-analytics-platform-ten.vercel.app/)

## Core Features

- 📊 View analytics for different subreddits
- 🔍 Analyze top posts from the last 24 hours
- 🏷️ AI-powered post categorization
- 💾 Efficient data caching
- 🎨 Modern, responsive UI

## Architecture Overview

### Core Libraries

- **@lib/supabaseClient.ts**
  - Initializes Supabase client for database operations
  - Handles connection to Supabase backend

- **@lib/analyze-posts.ts**
  - Core post analysis logic
  - Manages concurrent processing of posts
  - Handles caching of analysis results in Supabase

- **@lib/local-subreddits.ts**
  - Manages local storage of subreddit preferences
  - Handles default subreddit initialization
  - Provides subreddit CRUD operations

### API Routes

- **@api/analyze/route.ts**
  - Integrates with OpenAI API
  - Processes posts using GPT-4
  - Categorizes content into themes:
    - Solution Requests
    - Pain Points
    - Ideas
    - Advice Requests
    - Other

- **@api/posts/route.ts**
  - Handles Reddit API integration via Snoowrap
  - Implements 24-hour post caching
  - Manages post retrieval and storage

- **@api/subreddits/route.ts**
  - Manages subreddit information
  - Handles subreddit addition and updates
  - Implements caching for subreddit metadata

### Data Flow

1. User selects or adds a subreddit
2. System checks Supabase cache for recent data
3. If cache is stale:
   - Fetches new posts from Reddit
   - Analyzes posts using OpenAI
   - Updates cache with new data
4. Returns categorized posts to user

## Technology Stack

- **Frontend**: Next.js, Shadcn UI, Tailwind CSS
- **Backend**: Supabase
- **APIs**: Reddit (Snoowrap), OpenAI
- **Caching**: Supabase + Local Storage
- **Type Safety**: TypeScript

## Data Architecture

### Supabase Tables

- **subreddits**: Stores subreddit metadata
- **posts**: Caches Reddit posts
- **post_analysis**: Stores AI analysis results

### Caching Strategy

- Post data cached for 24 hours
- Subreddit metadata cached with periodic updates
- Analysis results stored permanently unless invalidated

## API Integration Details

### Reddit Integration
- Uses Snoowrap for Reddit API access
- Fetches posts from the last 24 hours
- Handles rate limiting and error cases

### OpenAI Integration
- Uses GPT-4 for post analysis
- Implements structured output format
- Handles concurrent processing for efficiency

## Performance Optimizations

- Concurrent post analysis
- Efficient data caching
- Lazy loading of subreddit data
- Local storage for user preferences
