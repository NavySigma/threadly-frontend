import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../api/posts";
import type { Post } from "../types/posts";

export type SortType = "newest" | "votes" | "unanswered" | "popular";

export function usePosts(search?: string) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortType>("popular");

  const queryParams = useMemo(() => {
    let sortParam = "latest";
    let isAnsweredParam: boolean | undefined = undefined;

    if (sortBy === "popular") sortParam = "popular";
    if (sortBy === "votes") sortParam = "votes";
    if (sortBy === "unanswered") {
      isAnsweredParam = false;
      sortParam = "latest";
    }

    return {
      page: currentPage,
      search,
      sort: sortParam,
      is_answered: isAnsweredParam,
    };
  }, [currentPage, search, sortBy]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", queryParams],
    queryFn: () => postsApi.getAll(queryParams),
    staleTime: 30 * 1000,
  });

  const posts = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data?.data]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    posts,
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
        queryKey: ["posts"],
      }),
  };
}
