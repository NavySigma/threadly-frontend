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

  const raw: any   = data;
  const tags       = raw?.data ?? [];
  const currentPage = raw?.current_page ?? 1;
  const lastPage    = raw?.last_page ?? 1;
  const total       = raw?.total ?? 0;

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