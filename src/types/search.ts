export interface SearchPostTag {
  id: string | number;
  name: string;
  color: string | null;
}

export interface SearchPostUser {
  id: string | number;
  username: string;
  avatar_url: string | null;
}

export interface SearchPost {
  id: string | number;
  title: string;
  body: string;
  vote_score: number;
  view_count: number;
  is_answered: boolean;
  created_at: string;
  tags: SearchPostTag[];
  user: SearchPostUser;
}

export interface SearchTag {
  id: string | number;
  name: string;
  color: string | null;
  description?: string | null;
  posts_count?: number;
  usage_count?: number;
}

export interface SearchUser {
  id: string | number;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  posts_count?: number;
}

export interface SearchResults {
  posts: SearchPost[];
  tags: SearchTag[];
  users: SearchUser[];
}

export type SearchType = "all" | "posts" | "tags" | "users";

export interface ParsedSearchQuery {
  type: SearchType;
  query: string;
}
