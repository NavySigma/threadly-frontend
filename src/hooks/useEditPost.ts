import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, tagsApi } from "../api/posts";
import type { Category, Tag, UpdatePostPayload } from "../types/posts";

export function useEditPost(postId: string) {
  const queryClient = useQueryClient();
  const [tagSearch, setTagSearch] = useState("");

  // ── Fetch post ──────────────────────────────────────────────────────────────
  const { data: originalPost, isLoading: isLoadingPost } = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => postsApi.getById(postId).then((r) => r.data),
    enabled: !!postId,
  });

  // ── Fetch categories ────────────────────────────────────────────────────────
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

  // ── Fetch tags ──────────────────────────────────────────────────────────────
  useQuery({
    queryKey: ["tags", tagSearch],
    queryFn: () => tagsApi.getAll({ search: tagSearch || undefined }).then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const tags: Tag[] =
    queryClient.getQueryData<Tag[]>(["tags", tagSearch]) ?? [];

  // ── Mutation ────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: UpdatePostPayload) =>
      postsApi.update(postId, payload).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["posts", postId], updated);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    originalPost,
    isLoadingPost,
    categories,
    tags,
    tagSearch,
    setTagSearch,
    isLoadingMeta,
    updatePost: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}