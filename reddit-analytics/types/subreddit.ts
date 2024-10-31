export interface Subreddit {
  id: string;
  name: string;
  memberCount: number;
  description: string | null;
  url: string;
  createdAt: Date;
} 