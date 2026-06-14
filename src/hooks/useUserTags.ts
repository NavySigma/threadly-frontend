import { useMemo, useState, useCallback } from "react";
import { useMyPosts } from "./useMyPosts";
import type { Tag } from "../types/posts";

export function useUserTags(userId: string) {
  const { posts, isLoading, error } = useMyPosts(userId);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagMap = new Map<string, Tag & { count: number }>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        const existing = tagMap.get(tag.id);
        if (existing) {
          existing.count += 1;
        } else {
          tagMap.set(tag.id, { ...tag, count: 1 });
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [posts]);

  const total = allTags.length;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  
  const tags = useMemo(() => {
    return allTags.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  }, [allTags, currentPage]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return {
    tags,
    allTags,
    total,
    currentPage,
    lastPage,
    isLoading,
    error,
    goToPage,
  };
}
