import { useQuery } from "@tanstack/react-query";
import { bookmarkApi } from "../api/bookmark.api";
import type { BookmarksResponse } from "../types/bookmark.types";

interface ApiFetchError {
  status: number;
  message?: string;
}

export function useBookmarks() {
  const query = useQuery<BookmarksResponse, ApiFetchError>({
    queryKey: ["bookmarks"],
    queryFn: () => bookmarkApi.list(),
    staleTime: 1000 * 30, // 30 seconds
  });

  const bookmarks = query.data?.data ?? [];
  const isLoading = query.isLoading;
  const error = query.error ? (query.error.message || "Gagal memuat bookmark.") : null;

  return {
    bookmarks,
    isLoading,
    error,
    refetch: query.refetch,
    meta: query.data ? {
      current_page: query.data.current_page,
      last_page: query.data.last_page,
      total: query.data.total,
    } : null,
  };
}
