import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, tagsApi } from "../api/posts";
import type { Category, Tag, CreatePostPayload } from "../types/posts";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const [tagSearch, setTagSearch] = useState("");

  // ── Categories ──────────────────────────────────────────────────────────────
  const { isLoading: isLoadingMeta } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      const flat: Category[] = [];
      for (const cat of res.data) {
        flat.push(cat);
        if (cat.children?.length) flat.push(...cat.children);
      }
      return flat;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] =
    queryClient.getQueryData<Category[]>(["categories"]) ?? [];

  // ── Tags ────────────────────────────────────────────────────────────────────
  useQuery({
    queryKey: ["tags", tagSearch],
    queryFn: () =>
      tagsApi.getAll({ search: tagSearch || undefined }).then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const tags: Tag[] =
    queryClient.getQueryData<Tag[]>(["tags", tagSearch]) ?? [];

  // ── Mutation ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      postsApi.create(payload).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  return {
    categories,
    tags,
    tagSearch,
    setTagSearch,
    isLoadingMeta,
    createPost: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
