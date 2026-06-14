import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi } from "../api/bookmark.api";

export function usePostBookmark(postId: string) {
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(false);
  const bookmarkedRef = useRef(false);

  const { data, isLoading: isCheckLoading } = useQuery({
    queryKey: ["bookmarkCheck", postId],
    queryFn: () => bookmarkApi.check(postId),
    enabled: !!postId,
  });

  useEffect(() => {
    if (data) {
      setBookmarked(data.is_bookmarked);
      bookmarkedRef.current = data.is_bookmarked;
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      bookmarkedRef.current
        ? bookmarkApi.remove(postId)
        : bookmarkApi.add(postId),

    onSuccess: () => {
      const wasBookmarked = bookmarkedRef.current;
      bookmarkedRef.current = !wasBookmarked;
      setBookmarked(!wasBookmarked);

      // Invalidate queries to refresh data automatically
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarkCheck", postId] });
    },

    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Gagal";
      console.error("PostBookmark error:", message);
    },
  });

  return {
    bookmarked,
    isCheckLoading,
    toggleBookmark: mutation.mutate,
    isToggling: mutation.isPending,
  };
}