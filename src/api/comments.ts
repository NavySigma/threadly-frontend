import { apiFetch } from "./client";

export interface CommentUser {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points?: number;
}

export interface Comment {
  id: string;
  body: string;
  parent_id: string | null;
  vote_score: number;
  likes_count: number;
  user_liked: boolean;
  user_vote: "upvote" | "downvote" | null;
  created_at: string;
  updated_at: string;
  user: CommentUser;
  replies: Comment[];
}

export interface PaginatedComments {
  data: Comment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateCommentPayload {
  body: string;
  parent_id?: string;
}

export interface UpdateCommentPayload {
  body: string;
}

export interface AcceptAnswerResponse {
  message: string;
}

export interface UnacceptAnswerResponse {
  message: string;
}

export const commentsApi = {
  getByPost: (postId: string, page = 1) =>
    apiFetch<PaginatedComments>(`/posts/${postId}/comments?page=${page}`),

  create: (postId: string, payload: CreateCommentPayload) =>
    apiFetch<{ message: string; data: Comment }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (commentId: string, payload: UpdateCommentPayload) =>
    apiFetch<{ message: string; data: Comment }>(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  accept: (postId: string, commentId: string) =>
    apiFetch<{ message: string }>(`/posts/${postId}/comments/${commentId}/accept`, {
      method: "POST",
    }),

  unaccept: (postId: string) =>
    apiFetch<{ message: string }>(`/posts/${postId}/unaccept`, {
      method: "DELETE",
    }),

  delete: (commentId: string) =>
    apiFetch<{ message: string }>(`/comments/${commentId}`, {
      method: "DELETE",
    }),
};