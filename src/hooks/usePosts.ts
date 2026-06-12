import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../api/posts";
import type { Post } from "../types/posts";

export type SortType = "newest" | "votes" | "unanswered" | "popular";

export function usePosts(search?: string) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortType>("newest");

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", currentPage, search ?? ""],
    queryFn: () => postsApi.getAll({ page: currentPage, search }),
    staleTime: 30 * 1000,
  });

  const sortedPosts = useMemo(() => {
    if (!data?.data) return [];
    const posts = [...data.data];

    switch (sortBy) {
      case "votes":
        return posts.sort((a, b) => b.vote_score - a.vote_score);
      case "unanswered":
        return posts.filter((p) => !p.is_answered);
      case "popular":
        // Popular: gabungan vote_score dan view_count (misal: 1 vote = 10 views)
        return posts.sort((a, b) => {
          const scoreA = a.vote_score * 10 + a.view_count;
          const scoreB = b.vote_score * 10 + b.view_count;
          return scoreB - scoreA;
        });
      case "newest":
      default:
        return posts.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
  }, [data?.data, sortBy]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    posts: sortedPosts,
    currentPage: data?.current_page ?? currentPage,
    lastPage: data?.last_page ?? 1,
    total: data?.total ?? 0,
    isLoading,
    error: error ? "Gagal memuat postingan." : null,
    sortBy,
    setSortBy,
    goToPage,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["posts", currentPage, search ?? ""],
      }),
  };
}
