export interface ThemeCategory {
  name: string;
  description: string;
  posts: {
    id: string;
    title: string;
    content: string;
    score: number;
    numComments: number;
    createdAt: Date;
    url: string;
  }[];
} 