import { useState, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchTagById, fetchPostsByTag } from "../api/tagDetail.api";
import type {
  Tag,
  Post,
  PaginationMeta,
  SortOption,
} from "../types/tagDetail.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tagDetailKeys = {
  all:   ()                                              => ["tag-detail"] as const,
  tag:   (id: string | number)                           => [...tagDetailKeys.all(), "tag",   id] as const,
  posts: (id: string | number, sort: SortOption, page: number) =>
                                                           [...tagDetailKeys.all(), "posts", id, sort, page] as const,
};

// ─── useTagDetail ─────────────────────────────────────────────────────────────

export interface UseTagDetailReturn {
  tag:       Tag | undefined;
  isLoading: boolean;
  isError:   boolean;
  error:     string | null;
}

export function useTagDetail(
  tagId: string | number | undefined
): UseTagDetailReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: tagDetailKeys.tag(tagId!),
    queryFn:  () => fetchTagById(tagId!),
    enabled:  !!tagId,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  return {
    tag: data,
    isLoading,
    isError,
    error: error ? (error as Error).message : null,
  };
}

// ─── useTagPosts ──────────────────────────────────────────────────────────────

export interface UseTagPostsReturn {
  posts:      Post[];
  meta:       PaginationMeta;
  isLoading:  boolean;
  isFetching: boolean;
  isError:    boolean;
  error:      string | null;
  sort:       SortOption;
  setSort:    (s: SortOption) => void;
  page:       number;
  goToPage:   (p: number) => void;
}

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page:    1,
  total:        0,
  per_page:     15,
};

export function useTagPosts(
  tagId: string | number | undefined,
  perPage = 15
): UseTagPostsReturn {
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const handleSetSort = useCallback((s: SortOption) => {
    setSort(s);
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: tagDetailKeys.posts(tagId!, sort, page),
    queryFn:  () => fetchPostsByTag({ tagId: tagId!, sort, page, per_page: perPage }),
    enabled:  !!tagId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

  // Normalise flat vs nested Laravel pagination
  const meta: PaginationMeta = data?.meta ?? {
    current_page: data?.current_page ?? DEFAULT_META.current_page,
    last_page:    data?.last_page    ?? DEFAULT_META.last_page,
    total:        data?.total        ?? DEFAULT_META.total,
    per_page:     perPage,
  };

  return {
    posts:     data?.data ?? [],
    meta,
    isLoading,
    isFetching,
    isError,
    error:     error ? (error as Error).message : null,
    sort,
    setSort:   handleSetSort,
    page,
    goToPage,
  };
}