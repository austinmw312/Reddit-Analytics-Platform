export interface RedditPost {
  id: string;
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdAt: Date;
  url: string;
} 