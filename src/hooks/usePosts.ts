import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../api/posts";

export function usePosts(search?: string) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">(
    "newest",
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", currentPage, search ?? ""],
    queryFn: () => postsApi.getAll({ page: currentPage, search }),
    staleTime: 30 * 1000,
  });

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    posts: data?.data ?? [],
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
