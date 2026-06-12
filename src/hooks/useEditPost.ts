import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, tagsApi } from "../api/posts";
import type { Category, Tag, UpdatePostPayload } from "../types/posts";

export interface EditPostForm {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}

export function useEditPost(postId: string) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EditPostForm>({
    category_id: "",
    title: "",
    body: "",
    selectedTags: [],
  });
  const [tagSearch, setTagSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ── Fetch post ──────────────────────────────────────────────────────────────
  const { data: originalPost, isLoading: isLoadingPost } = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => postsApi.getById(postId).then((r) => r.data),
    enabled: !!postId,
  });

  // Inisialisasi form dari data post (hanya sekali)
  if (originalPost && !initialized) {
    setForm({
      category_id: originalPost.category.id,
      title: originalPost.title,
      body: originalPost.body,
      selectedTags: originalPost.tags ?? [],
    });
    setInitialized(true);
  }

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

  // ── Form helpers ────────────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof EditPostForm>(key: K, value: EditPostForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const addTag = useCallback((tag: Tag) => {
    setForm((prev) => {
      if (prev.selectedTags.length >= 5) return prev;
      if (prev.selectedTags.some((t) => t.id === tag.id)) return prev;
      return { ...prev, selectedTags: [...prev.selectedTags, tag] };
    });
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.filter((t) => t.id !== tagId),
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!form.category_id) errs.category_id = "Pilih kategori terlebih dahulu.";
    if (!form.title.trim()) {
      errs.title = "Judul tidak boleh kosong.";
    } else if (form.title.trim().length < 10) {
      errs.title = "Judul minimal 10 karakter.";
    } else if (form.title.length > 300) {
      errs.title = "Judul maksimal 300 karakter.";
    }
    if (!form.body.trim()) {
      errs.body = "Konten tidak boleh kosong.";
    } else if (form.body.trim().length < 20) {
      errs.body = "Konten minimal 20 karakter.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const submit = useCallback(async (): Promise<boolean> => {
    setGlobalError(null);
    if (!validate()) return false;
    try {
      const payload: UpdatePostPayload = {
        category_id: form.category_id,
        title: form.title.trim(),
        body: form.body.trim(),
        tags: form.selectedTags.map((t) => t.id),
      };
      await mutation.mutateAsync(payload);
      return true;
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.errors && typeof err.errors === "object") {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors as Record<string, unknown>)) {
          mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
        }
        setErrors(mapped);
      } else if (typeof err?.message === "string") {
        setGlobalError(err.message);
      } else {
        setGlobalError("Terjadi kesalahan tak terduga. Coba lagi.");
      }
      return false;
    }
  }, [form, validate, mutation]);

  return {
    form,
    originalPost,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isLoadingPost,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errors,
    globalError,
    setField,
    setTagSearch,
    addTag,
    removeTag,
    submit,
  };
}