// src/hooks/useTags.ts
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTags, type TagsParams } from "../api/tags";

export function useTags() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TagsParams["sort"]>("popular");
  const PER_PAGE = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["tags", { page, search, sort }],
    queryFn: () => fetchTags({ page, per_page: PER_PAGE, search, sort }),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const tags = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const lastPage = data?.meta?.last_page ? Math.max(1, data.meta.last_page) : 1;
  const currentPage = Math.min(page, lastPage);

  return {
    tags,
    currentPage,
    lastPage,
    total,
    isLoading,
    error: error ? (error as Error).message : null,
    search,
    setSearch: (v: string) => {
      setSearch(v);
      setPage(1);
    },
    sort,
    setSort: (v: TagsParams["sort"]) => {
      setSort(v);
      setPage(1);
    },
    goToPage,
  };
}
