// src/hooks/useEditPost.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { postsApi, categoriesApi, tagsApi } from "../api/posts";
import type { Category, Tag, Post, UpdatePostPayload } from "../api/posts";

export interface EditPostForm {
  category_id: string;
  title: string;
  body: string;
  selectedTags: Tag[];
}

export function useEditPost(postId: string) {
  const [form, setForm] = useState<EditPostForm>({
    category_id: "",
    title: "",
    body: "",
    selectedTags: [],
  });
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch post yang akan diedit
  useEffect(() => {
    let cancelled = false;
    setIsLoadingPost(true);

    postsApi
      .getById(postId)
      .then((res) => {
        if (cancelled) return;
        const post = res.data;
        setOriginalPost(post);
        setForm({
          category_id: post.category.id,
          title: post.title,
          body: post.body,
          selectedTags: post.tags ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setGlobalError("Gagal memuat postingan.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPost(false);
      });

    return () => { cancelled = true; };
  }, [postId]);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    categoriesApi.getAll().then((res) => {
      if (cancelled) return;
      const flat: Category[] = [];
      for (const cat of res.data) {
        flat.push(cat);
        if (cat.children?.length) flat.push(...cat.children);
      }
      setCategories(flat);
    }).finally(() => {
      if (!cancelled) setIsLoadingMeta(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch tags dengan debounce
  useEffect(() => {
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    tagSearchTimer.current = setTimeout(async () => {
      try {
        const res = await tagsApi.getAll({ search: tagSearch || undefined });
        setTags(res.data);
      } catch {
        console.error("Failed to load tags");
      }
    }, 300);
    return () => { if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current); };
  }, [tagSearch]);

  const setField = useCallback(
    <K extends keyof EditPostForm>(key: K, value: EditPostForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

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
    setIsSubmitting(true);
    try {
      const payload: UpdatePostPayload = {
        category_id: form.category_id,
        title: form.title.trim(),
        body: form.body.trim(),
        tags: form.selectedTags.map((t) => t.id),
      };
      await postsApi.update(postId, payload);
      setIsSuccess(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }, [form, postId, validate]);

  return {
    form,
    originalPost,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isLoadingPost,
    isSubmitting,
    isSuccess,
    errors,
    globalError,
    setField,
    setTagSearch,
    addTag,
    removeTag,
    submit,
  };
}