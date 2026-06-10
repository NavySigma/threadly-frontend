import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPosts, fetchCategories, sortPosts, filterByAnswer } from "../api";
import type { Post, PostFilter, PaginationMeta, Category } from "../types";

// ── Debounce ───────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ── usePosts ───────────────────────────────────────────────────────────
export function usePosts(filter: PostFilter, token?: string) {
  const [rawPosts, setRawPosts]   = useState<Post[]>([]);
  const [meta, setMeta]           = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);

  const prevFilter = useRef(filter);
  useEffect(() => {
    const prev = prevFilter.current;
    if (prev.search !== filter.search || prev.category_id !== filter.category_id) {
      setPage(1);
    }
    prevFilter.current = filter;
  }, [filter]);

  const debouncedSearch = useDebounce(filter.search, 400);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPosts(
        { search: debouncedSearch || undefined, category_id: filter.category_id || undefined, page },
        token
      );
      setRawPosts(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat postingan.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filter.category_id, page, token]);

  useEffect(() => { load(); }, [load]);

  const posts = filterByAnswer(sortPosts(rawPosts, filter.sort), filter.answer);

  return { posts, meta, isLoading, error, page, setPage, refetch: load };
}

// ── useCategories ──────────────────────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch((err)  => { if (!cancelled) setError(err.message); })
      .finally(()   => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { categories, isLoading, error };
}