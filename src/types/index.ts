// ── Auth re-exports ────────────────────────────────────────────────────
export type {
  RegisterPayload,
  LoginPayload,
  LoginResponse,
  RegisterResponse,
  ApiError,
  User,
} from "./auth";

// ── Local import for use within this file ─────────────────────────────
import type { User } from "./auth";

// ── Entities ──────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  status: "open" | "closed";
  view_count: number;
  vote_score: number;
  is_answered: boolean;
  accepted_answer_id: string | null;
  answers_count?: number;
  created_at: string;
  created_at_human?: string;
  updated_at: string;
  closed_at?: string | null;
  user: User;
  category: Category;
  tags: Tag[];
}

// ── Filter & Sort ──────────────────────────────────────────────────────
export type SortOption = "latest" | "oldest" | "highest_vote" | "most_viewed";
export type AnswerFilter = "all" | "answered" | "unanswered";

export interface PostFilter {
  search: string;
  tag_id: string;
  category_id: string;
  sort: SortOption;
  answer: AnswerFilter;
}

// ── API Response ───────────────────────────────────────────────────────
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
