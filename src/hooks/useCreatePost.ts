import { useState, useEffect, useCallback, useRef } from "react";
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
  const [form, setForm] = useState<CreatePostForm>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
        
    categoriesApi.getAll().then((res) => {
      if (!cancelled) {
        const flat: Category[] = [];
        for (const cat of res.data) {
          flat.push(cat);
          if (cat.children?.length) flat.push(...cat.children);
        }
        setCategories(flat);
      }
    }).finally(() => {
      if (!cancelled) setIsLoadingMeta(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    tagSearchTimer.current = setTimeout(async () => {
      try {
        const res = await tagsApi.getAll({ search: tagSearch || undefined });
        const list = Array.isArray(res) ? res : (res as any).data ?? [];
        setTags(list);
      } catch {}
    }, 300);
    return () => {
      if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    };
  }, [tagSearch]);

  const setField = useCallback(
    <K extends keyof CreatePostForm>(key: K, value: CreatePostForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
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

  const validate = (): boolean => {
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
  };

  const submit = useCallback(async (): Promise<string | null> => {
    setGlobalError(null);
    if (!validate()) return null;
    setIsSubmitting(true);
    try {
      const payload: CreatePostPayload = {
        category_id: form.category_id,
        title: form.title.trim(),
        body: form.body.trim(),
        tags: form.selectedTags.map((t) => t.id),
      };
      const res = await postsApi.create(payload);
      setIsSuccess(true);
      setForm(INITIAL_FORM);
      return res.data.id;
    } catch (err: any) {
      if (err?.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          mapped[field] = Array.isArray(messages) ? messages[0] : String(messages);
        }
        setErrors(mapped);
      } else if (err?.message) {
        setGlobalError(err.message);
      } else {
        setGlobalError("Terjadi kesalahan tak terduga. Coba lagi.");
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setGlobalError(null);
    setIsSuccess(false);
  }, []);

  return {
    form,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isSubmitting,
    isSuccess,
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