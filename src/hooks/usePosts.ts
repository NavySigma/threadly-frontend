import { useState, useEffect, useCallback } from "react";
import { postsApi } from "../api/posts";
import type { Post } from "../api/posts";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">("newest");

  const fetchPosts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await postsApi.getAll({ page });
      setPosts(res.data);
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      setError("Gagal memuat postingan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const goToPage = useCallback((page: number) => {
    fetchPosts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchPosts]);

  return {
    posts,
    currentPage,
    lastPage,
    total,
    isLoading,
    error,
    sortBy,
    setSortBy,
    goToPage,
    refetch: () => fetchPosts(currentPage),
  };
}