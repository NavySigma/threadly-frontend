import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/category.api";
import type {
  Category,
  CategoriesParams,
  PaginationMeta,
} from "../types/category.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const categoryKeys = {
  all:    ()                           => ["categories"] as const,
  lists:  ()                           => [...categoryKeys.all(), "list"] as const,
  list:   (params: CategoriesParams)   => [...categoryKeys.lists(), params] as const,
  detail: (id: number | string)        => [...categoryKeys.all(), "detail", id] as const,
};

// ─── useCategories ────────────────────────────────────────────────────────────

export interface UseCategoriesReturn {
  categories:  Category[];
  meta:        PaginationMeta;
  isLoading:   boolean;
  isFetching:  boolean;
  isError:     boolean;
  error:       string | null;
  search:      string;
  setSearch:   (v: string) => void;
  page:        number;
  goToPage:    (p: number) => void;
}

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page:    1,
  total:        0,
  per_page:     20,
};

export function useCategories(perPage = 20): UseCategoriesReturn {
  const [search, setSearchRaw] = useState("");
  const [page, setPage]        = useState(1);

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const params: CategoriesParams = { page, per_page: perPage, search: search || undefined };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey:        categoryKeys.list(params),
    queryFn:         () => fetchCategories(params),
    placeholderData: keepPreviousData,
    staleTime:       1000 * 60 * 5,
  });

  const meta: PaginationMeta = data?.meta ?? {
    current_page: data?.current_page ?? DEFAULT_META.current_page,
    last_page:    data?.last_page    ?? DEFAULT_META.last_page,
    total:        data?.total        ?? DEFAULT_META.total,
    per_page:     perPage,
  };

  return {
    categories: data?.data ?? [],
    meta,
    isLoading,
    isFetching,
    isError,
    error:      error instanceof Error ? error.message : null,
    search,
    setSearch,
    page,
    goToPage,
  };
}

// ─── useCategoryDetail ────────────────────────────────────────────────────────

export interface UseCategoryDetailReturn {
  category:  Category | undefined;
  isLoading: boolean;
  isError:   boolean;
  error:     string | null;
}

export function useCategoryDetail(
  id: number | string | undefined
): UseCategoryDetailReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey:  categoryKeys.detail(id!),
    queryFn:   () => fetchCategoryById(id!),
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    category:  data,
    isLoading,
    isError,
    error:     error instanceof Error ? error.message : null,
  };
}

// ─── useCategoryMutations ─────────────────────────────────────────────────────

export interface UseCategoryMutationsReturn {
  createCat:       (payload: { name: string; description?: string; parent_id?: number | null }) => void;
  updateCat:       (id: number, payload: { name?: string; description?: string; parent_id?: number | null }) => void;
  deleteCat:       (id: number) => void;
  isCreating:      boolean;
  isUpdating:      boolean;
  isDeleting:      boolean;
}

export function useCategoryMutations(): UseCategoryMutationsReturn {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createCategory,
    onSuccess:  invalidate,
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: {
      id: number;
      payload: { name?: string; description?: string; parent_id?: number | null };
    }) => updateCategory(id, payload),
    onSuccess: invalidate,
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteCategory,
    onSuccess:  invalidate,
  });

  return {
    createCat:  (payload) => create(payload),
    updateCat:  (id, payload) => update({ id, payload }),
    deleteCat:  (id) => remove(id),
    isCreating,
    isUpdating,
    isDeleting,
  };
}