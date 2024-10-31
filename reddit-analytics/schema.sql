-- Create function for updating timestamp first
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create subreddits table
CREATE TABLE subreddits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    member_count INTEGER,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON subreddits
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reddit_id TEXT UNIQUE NOT NULL,
    subreddit_id UUID REFERENCES subreddits(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    score INTEGER,
    num_comments INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    url TEXT
);

-- Create post_analysis table
CREATE TABLE post_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    is_solution_request BOOLEAN,
    is_pain_point BOOLEAN,
    is_idea BOOLEAN,
    is_advice_request BOOLEAN,
    is_other BOOLEAN,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_subreddit_id ON posts(subreddit_id);
CREATE INDEX idx_posts_retrieved_at ON posts(retrieved_at);
CREATE INDEX idx_post_analysis_post_id ON post_analysis(post_id);
CREATE INDEX idx_post_analysis_analyzed_at ON post_analysis(analyzed_at); 