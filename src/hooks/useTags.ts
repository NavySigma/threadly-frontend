// src/hooks/useTags.ts
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTags, type TagsParams } from "../api/tags";

export function useTags() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState<TagsParams["sort"]>("popular");
  const PER_PAGE = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["tags", { search, sort }], // Remove page from query key if we want to fetch all and paginate locally, or keep it if API might support it
    queryFn:  () => fetchTags({ search, sort, per_page: 1000 }), // Fetch more to allow local pagination if API doesn't support per_page
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const allTags = data?.data ?? [];
  const total = allTags.length;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  
  // Local pagination
  const currentPage = Math.min(page, lastPage);
  const tags = allTags.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

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