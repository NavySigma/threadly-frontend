export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
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
  user: PostUser;
  category: Category;
  tags: Tag[];
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
}

export interface InitialValueCreatePost {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}
