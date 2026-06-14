import { apiFetch } from "./client";
import type { UserPost, UserPostsResponse } from "../types/userPost.type";

export const userPostsApi = {
  getMyPosts: (page = 1) =>
    apiFetch<UserPostsResponse>(`/me/posts?page=${page}`),

  closePost: (postId: string) =>
    apiFetch<{ message: string; data: UserPost }>(`/posts/${postId}/close`, {
      method: "PATCH",
    }),

  reopenPost: (postId: string) =>
    apiFetch<{ message: string; data: UserPost }>(`/posts/${postId}/reopen`, {
      method: "PATCH",
    }),
};
