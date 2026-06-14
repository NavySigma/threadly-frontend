import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Post } from "../types";

interface MyPostsResponse {
  data: Post[];
}

interface ApiFetchError {
  status: number;
  message?: string;
}

export function useMyPosts(userId?: string) {
  const query = useQuery<MyPostsResponse, ApiFetchError>({
    queryKey: ["myPosts", userId],
    queryFn: () => apiFetch<MyPostsResponse>(`/users/${userId}/posts?status=all`),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  const posts = query.data?.data ?? [];
  const isLoading = query.isLoading;
  const error = query.error ? (query.error.message || "Gagal memuat postingan.") : null;

  return {
    posts,
    isLoading,
    error,
    refetch: query.refetch,
  };
}

