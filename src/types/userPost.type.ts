import type { Post } from "./index";

export type UserPost = Post;

export interface UserPostsResponse {
  data: UserPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
