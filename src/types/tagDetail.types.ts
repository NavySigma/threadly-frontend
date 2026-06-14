export interface Tag {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  posts_count: number;
  usage_count?: number;
  created_at?: string;
}

export interface Author {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  reputation_points: number;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  slug: string | null;
  votes_count: number;
  comments_count: number;
  views_count: number;
  is_closed: boolean;
  accepted_comment_id: number | null;
  created_at: string;
  updated_at: string;
  author: Author;
  category: Category;
  tags: Tag[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface TagDetailResponse {
  data: Tag;
}

export interface TagPostsResponse {
  data: Post[];
  meta?: PaginationMeta;
  current_page?: number;
  last_page?: number;
  total?: number;
}

export type SortOption = "newest" | "active" | "votes" | "unanswered";

export interface TagPostsParams {
  tagId: string | number;
  sort: SortOption;
  page: number;
  per_page?: number;
}