import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, categoriesApi, tagsApi } from "../api/posts";
import type { Category, Tag, CreatePostPayload } from "../api/posts";

export interface CreatePostForm {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}

const INITIAL_FORM: CreatePostForm = {
  category_id: "",
  title: "",
  body: "",
  selectedTags: [],
};

export function useCreatePost() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreatePostForm>(INITIAL_FORM);
  const [tagSearch, setTagSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

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
    queryFn: () => tagsApi.getAll({ search: tagSearch || undefined }).then((r) => r.data),
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

  // ── Form helpers ────────────────────────────────────────────────────────────
  const setField = useCallback(<K extends keyof CreatePostForm>(key: K, value: CreatePostForm[K]) => {
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

  const submit = useCallback(async (): Promise<string | null> => {
    setGlobalError(null);
    if (!validate()) return null;

    const payload: CreatePostPayload = {
      category_id: form.category_id,
      title: form.title.trim(),
      body: form.body.trim(),
      tags: form.selectedTags.map((t) => t.id),
    };

    try {
      const post = await mutation.mutateAsync(payload);
      setForm(INITIAL_FORM);
      return post.id;
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
      return null;
    }
  }, [form, validate, mutation]);

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setGlobalError(null);
    mutation.reset();
  }, [mutation]);

  return {
    form,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errors,
    globalError,
    setField,
    setTagSearch,
    addTag,
    removeTag,
    submit,
    reset,
  };
}