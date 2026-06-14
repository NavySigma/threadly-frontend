export interface Tag {
  id: string;
  name: string;
  slug?: string;
  color: string | null;
  usage_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  children?: Category[];
}

export interface PostUser {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points?: number;
  name?: string;
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
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  user: PostUser;
  category: Category;
  tags: Tag[];
  votes_count?: number;
  answers_count?: number;
  views_count?: number;
  created_at_human?: string;
}

export interface CreatePostPayload {
  category_id: string;
  title: string;
  body: string;
  tags?: string[];
}

export interface UpdatePostPayload {
  category_id?: string;
  title?: string;
  body?: string;
  tags?: string[];
}

export interface PaginatedPosts {
  data: Post[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PostsParams {
  search?: string;
  category_id?: string;
  page?: number;
  sort?: string;
  is_answered?: boolean;
}

export interface InitialValueCreatePost {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}

export interface InitialValueEditPost {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}
