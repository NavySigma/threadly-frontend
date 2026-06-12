// src/hooks/useTags.ts
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTags, type TagsParams } from "../api/tags";

export function useTags() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<TagsParams["sort"]>("popular");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tags", { page, search, sort }],
    queryFn:  () => fetchTags({ page, per_page: 36, search, sort }),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle both structures:
  // 1. Laravel default: { data: [], meta: { current_page, last_page, total } }
  // 2. Custom:          { data: [], current_page, last_page, total }
  const tags        = data?.data                           ?? [];
  const currentPage = data?.meta?.current_page ?? data?.current_page ?? 1;
  const lastPage    = data?.meta?.last_page    ?? data?.last_page    ?? 1;
  const total       = data?.meta?.total        ?? data?.total        ?? 0;

  return {
    tags,
    currentPage,
    lastPage,
    total,
    isLoading,
    error:     error ? (error as Error).message : null,
    search,
    setSearch: (v: string) => { setSearch(v); setPage(1); },
    sort,
    setSort:   (v: TagsParams["sort"]) => { setSort(v); setPage(1); },
    goToPage,
  };
}