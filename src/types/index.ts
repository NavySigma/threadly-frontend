<<<<<<< HEAD
// Re-export auth-related types
export type {
  RegisterPayload,
  LoginPayload,
  User,
  LoginResponse,
  RegisterResponse,
  ApiError,
} from "./auth";

=======
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

>>>>>>> 9e8cf1b7671ccf147982ac2ae6ce2693ec5f7aa6
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
  status: "open" | "closed" | "deleted";
  view_count: number;
  vote_score: number;
  is_answered: boolean;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  category: Category;
  tags: Tag[];
}

// ── Filter & Sort ──────────────────────────────────────────────────────
export type SortOption = "latest" | "oldest" | "highest_vote" | "most_viewed";
export type AnswerFilter = "all" | "answered" | "unanswered";

export interface PostFilter {
  search: string;
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
