# Reddit Analytics Platform - Supabase Integration Design Document

## Table of Contents

1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Current Project Structure](#current-project-structure)
4. [Supabase Integration Requirements](#supabase-integration-requirements)
5. [Database Design](#database-design)
6. [Backend Integration](#backend-integration)
7. [Frontend Integration](#frontend-integration)
8. [Data Refresh Logic](#data-refresh-logic)
9. [Implementation Steps](#implementation-steps)
10. [Conclusion](#conclusion)
11. [Appendix: Database Schema Details](#appendix-database-schema-details)
12. [Considerations](#considerations)

## Introduction

This document provides a detailed plan for integrating Supabase into the Reddit Analytics Platform. The goal of this integration is to persist Reddit posts and their corresponding AI analysis data, reducing redundant API calls to Reddit and OpenAI. By caching the data after the initial fetch and analysis, we aim to improve performance and efficiency, only refetching data if it's older than 24 hours.

## Project Overview

The Reddit Analytics Platform is a web application that allows users to:

- Add Subreddits: Users can add subreddits to monitor and analyze
- View Top Posts: Display top posts from the added subreddits
- Categorize Posts: Analyze and categorize posts into predefined themes using the OpenAI API

### Current Limitations:

- No Data Persistence: Reddit posts and AI analysis data are not stored in a database
- Inefficient API Usage: The application fetches data from Reddit and calls the OpenAI API every time a user opens a subreddit page
- Performance Issues: Redundant API calls can lead to slower response times and increased costs

### Objective:

Integrate Supabase to store and retrieve Reddit posts and AI analysis data, ensuring data is only fetched and analyzed if it's older than 24 hours.

## Current Project Structure

reddit-analytics
├── README.md
├── app
│ ├── api
│ │ ├── analyze
│ │ ├── posts
│ │ └── subreddits
│ ├── favicon.ico
│ ├── fonts
│ │ ├── GeistMonoVF.woff
│ │ └── GeistVF.woff
│ ├── globals.css
│ ├── layout.tsx
│ ├── page.tsx
│ └── subreddit-page
│ ├── not-found.tsx
│ └── page.tsx
├── components
│ ├── add-subreddit-modal.tsx
│ ├── category-label.tsx
│ ├── subreddit-card.tsx
│ └── theme-card.tsx
├── components.json
├── hooks
│ └── use-toast.ts
├── instructions
│ └── instructions.md
├── lib
│ ├── analyze-posts.ts
│ └── utils.ts
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

The project is organized as follows:

- API Routes: Located under `app/api/`
- Frontend Pages: Located under `app/`
- Components: Reusable UI components under `components/`
- Types: TypeScript type definitions under `types/`
- Lib: Utility functions and API clients under `lib/`

## Supabase Integration Requirements

To optimize data handling and performance, we need to:

- Persist Data: Store Reddit posts and AI analysis results in Supabase
- Implement Caching: Serve data from Supabase if it's less than 24 hours old
- Optimize API Calls: Only refetch data from Reddit and re-analyze with OpenAI if the cached data is stale
- Maintain Compatibility: Ensure the integration aligns with the existing project structure

## Database Design

To effectively store and manage data, we need to design a robust database schema in Supabase.

### Database Tables and Schemas

#### Subreddits Table

**Purpose**: Store information about subreddits added by users.

| Column       | Type     | Constraints      | Description                                   |
| ------------ | -------- | ---------------- | --------------------------------------------- |
| id           | UUID     | Primary Key      | Unique identifier for the subreddit record    |
| name         | Text     | Unique, Not Null | The name of the subreddit (e.g., "askreddit") |
| description  | Text     |                  | Description of the subreddit                  |
| member_count | Integer  |                  | Number of subscribers                         |
| url          | Text     |                  | URL to the subreddit                          |
| created_at   | DateTime | Default Now      | Timestamp when the record was created         |
| updated_at   | DateTime |                  | Timestamp when the record was last updated    |

#### Posts Table

**Purpose**: Store Reddit posts fetched from subreddits.

| Column       | Type     | Constraints      | Description                           |
| ------------ | -------- | ---------------- | ------------------------------------- |
| id           | UUID     | Primary Key      | Unique identifier for the post record |
| reddit_id    | Text     | Unique, Not Null | The Reddit-assigned ID for the post   |
| subreddit_id | UUID     | Foreign Key      | References subreddits.id              |
| title        | Text     | Not Null         | Title of the post                     |
| content      | Text     |                  | Body or self-text of the post         |
| score        | Integer  |                  | Number of upvotes                     |
| num_comments | Integer  |                  | Number of comments                    |
| created_at   | DateTime |                  | When the post was created on Reddit   |
| retrieved_at | DateTime | Default Now      | When the post was fetched from Reddit |
| url          | Text     |                  | Direct link to the Reddit post        |

#### Post Analysis Table

**Purpose**: Store AI analysis results for each post.

| Column              | Type     | Constraints | Description                                   |
| ------------------- | -------- | ----------- | --------------------------------------------- |
| id                  | UUID     | Primary Key | Unique identifier for the analysis record     |
| post_id             | UUID     | Foreign Key | References posts.id                           |
| is_solution_request | Boolean  |             | True if the post is a solution request        |
| is_pain_point       | Boolean  |             | True if the post expresses a pain point       |
| is_idea             | Boolean  |             | True if the post introduces an idea           |
| is_advice_request   | Boolean  |             | True if the post is an advice request         |
| is_other            | Boolean  |             | True if the post doesn't fit other categories |
| analyzed_at         | DateTime | Default Now | When the analysis was performed               |

## Backend Integration

### Updating API Routes

We need to modify existing API routes to interact with Supabase and implement caching logic.

#### app/api/subreddits/route.ts

**Functionality**:

- On adding a new subreddit:
  - Store subreddit information in the subreddits table
  - Check if the subreddit already exists to prevent duplicates

**Changes**:

- Integrate Supabase client to perform database operations
- Update POST route to insert or retrieve subreddit data from Supabase

#### app/api/posts/route.ts

**Functionality**:

- Fetch posts for a subreddit from Supabase if data is recent
- If data is stale or doesn't exist, fetch from Reddit and store in Supabase

**Changes**:

- Before fetching from Reddit:
  - Check posts table for recent data (less than 24 hours old)
  - Use retrieved_at to determine data freshness
- After fetching from Reddit:
  - Store new posts in the posts table
  - Update retrieved_at

#### app/api/analyze/route.ts

**Functionality**:

- Perform AI analysis on posts if analysis data is stale or missing
- Store analysis results in the post_analysis table

**Changes**:

- Check post_analysis table for existing analysis data
- Use analyzed_at to determine if re-analysis is needed
- Store new analysis results after OpenAI API call

### Data Fetching Logic

Implement logic in API routes to:

**Check Data Freshness**:

- Compare current timestamp with retrieved_at and analyzed_at
- Define a threshold of 24 hours

**Fetch and Store Data**:

- If data is stale:
  - Fetch fresh data from Reddit
  - Re-analyze posts with OpenAI
  - Update Supabase tables accordingly

## Frontend Integration

- Data Retrieval:
  - Update components to fetch data via the modified API routes
  - Ensure the frontend consumes data from Supabase through the backend
- State Management:
  - Handle loading states while data is being fetched or analyzed
  - Display cached data immediately if available
- User Experience:
  - Inform users when data is being refreshed
  - Ensure seamless integration without disrupting the existing UI

## Data Refresh Logic

Implement a strategy to refresh data only when necessary:

### Threshold Definition:

- Set a 24-hour threshold for data freshness

### Refresh Triggers:

Data is fetched from Reddit and re-analyzed if:

- There is no existing data
- Existing data is older than 24 hours

### Scheduling (Optional):

- Implement background jobs or scheduled functions to refresh data periodically
- This can be handled using Supabase Functions or external cron jobs

## Implementation Steps

1. Set Up Supabase Project:

   - Create a new Supabase project
   - Obtain NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

2. Define Database Schema:

   - Use Supabase SQL editor or migration files to create the subreddits, posts, and post_analysis tables
   - Ensure constraints and relationships are correctly set

3. Update Environment Variables:

   - Add Supabase credentials to the project's environment variables
   - Securely manage .env files and avoid committing them to version control

4. Install Supabase Client Library:

   ```bash
   npm install @supabase/supabase-js
   ```

5. Modify API Routes:

   - app/api/subreddits/route.ts:
     - Import Supabase client
     - Update POST route to interact with the subreddits table
   - app/api/posts/route.ts:
     - Check for existing posts in Supabase
     - Fetch from Reddit and store in Supabase if needed
   - app/api/analyze/route.ts:
     - Check for existing analysis results
     - Use OpenAI API and store results if analysis is stale or missing

6. Implement Data Fetching Logic:

   - Add helper functions to determine data freshness
   - Use timestamps to compare against the 24-hour threshold

7. Update Frontend Components:

   - Ensure frontend components use the updated API endpoints
   - Handle any changes in the data format returned by the APIs

8. Testing:

   - Thoroughly test each API route for correct data retrieval and storage
   - Test the flow of adding subreddits, viewing posts, and analyzing data
   - Verify that stale data triggers a refresh

9. Error Handling and Logging:

   - Implement try-catch blocks around API calls
   - Log errors for debugging purposes
   - Provide user-friendly error messages on the frontend

10. Deployment Considerations:
    - Ensure Supabase credentials are secured in production
    - Monitor API usage to prevent exceeding rate limits

## Conclusion

By integrating Supabase into the Reddit Analytics Platform, we can significantly improve performance and efficiency. Storing Reddit posts and AI analysis data reduces redundant API calls and ensures a smoother user experience. This document provides a comprehensive guide for backend developers to implement the required changes, aligning with the existing project structure and optimizing data handling.

## Considerations

### Data Consistency:

- Ensure foreign key relationships maintain data integrity
- Implement cascading deletes or updates if necessary

### Concurrency:

- Handle potential race conditions when multiple users are adding the same subreddit or viewing the same posts

### Rate Limiting:

- Be mindful of Reddit and OpenAI API rate limits
- Implement exponential backoff or request throttling if needed

### Security:

- Protect API endpoints from unauthorized access
- Use Supabase's authentication and row-level security features if expanding to multiple users

### Extension for Multiple Users (Optional):

- If planning to support multiple users, adjust the schema to associate subreddits and posts with specific users

### Performance Optimization:

- Add indexes on frequently queried columns, such as reddit_id, subreddit_id, and post_id
- Consider data caching mechanisms if needed
