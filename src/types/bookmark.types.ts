import type { Post } from "./posts";

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post?: Post;
}

export interface BookmarksResponse {
  current_page: number;
  data: Bookmark[];
  first_page_url: string | null;
  from: number | null;
  last_page_url: string | null;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface CheckBookmarkResponse {
  is_bookmarked: boolean;
}

export interface CreateBookmarkResponse {
  message: string;
}

export interface DeleteBookmarkResponse {
  message: string;
}

export interface CreateBookmarkPayload {
  post_id: string;
}