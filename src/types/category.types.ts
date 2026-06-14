// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  posts_count?: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface CategoriesResponse {
  data: Category[];
  meta?: PaginationMeta;
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface CategoryResponse {
  data: Category;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface CategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
}