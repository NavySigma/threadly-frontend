import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useCreatePost } from "../../../hooks/useCreatePost";
import { useAuth } from "../../../hooks/useAuth";
import type { Tag, Category, CreatePostPayload, InitialValueCreatePost } from "../../../types/posts";
import { CreatePostSchema } from "./createpostpage.validation";

const TITLE_MIN = 15;
const TITLE_MAX = 300;
const BODY_MIN = 30;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="form-error text-red-500 text-xs mt-1 flex items-center gap-1">
      <span>⚠</span> {message}
    </div>
  );
}

function CharHint({ current, min, max }: { current: number; min?: number; max: number }) {
  const belowMin = min !== undefined && current < min;
  return (
    <div className="flex justify-between items-center mt-1 gap-2">
      {min !== undefined && (
        <span className="text-xs" style={{ color: belowMin ? "#d73a49" : "#2ea043" }}>
          {belowMin
            ? `${min - current} more character${min - current !== 1 ? "s" : ""} required (min ${min})`
            : `✓ Minimum met`}
        </span>
      )}
      <span className="text-xs text-gray-400 ml-auto">{current}/{max}</span>
    </div>
  );
}

function TagBadge({ tag, onRemove, onClick }: { tag: Tag; onRemove?: () => void; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className="tag-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white cursor-pointer transition-colors"
      style={{ backgroundColor: tag.color ?? "#6a737c" }}
    >
      {tag.name}
      {tag.isNew && <span className="text-[9px] bg-black/20 px-1 rounded font-normal">new</span>}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="tag-badge-remove hover:text-red-200 focus:outline-none text-sm font-bold"
          aria-label={`Remove tag ${tag.name}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { categories, tags, tagSearch, setTagSearch, isLoadingMeta, createPost, isSubmitting } = useCreatePost();

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { replace: true });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node) &&
        !tagInputRef.current?.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formik = useFormik<InitialValueCreatePost & { selectedTags: (Tag & { isNew?: boolean })[] }>({
    initialValues: { category_id: "", title: "", body: "", selectedTags: [] },
    validationSchema: CreatePostSchema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setGlobalError(null);
      
      // 🛠️ PERBAIKAN: Berikan type assertion 'as string[]' agar TypeScript mengizinkan pengiriman string nama tag baru
      const payload: CreatePostPayload = {
        category_id: values.category_id,
        title: values.title.trim(),
        body: values.body.trim(),
        tags: values.selectedTags.map((t) => (t.isNew ? t.name : t.id)) as string[],
      };
      
      try {
        const post = await createPost(payload);
        formik.resetForm();
        if (post && post.id) navigate("/");
      } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        if (err?.errors && typeof err.errors === "object") {
          const mapped: Record<string, string> = {};
          for (const [field, messages] of Object.entries(err.errors as Record<string, unknown>)) {
            mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
          }
          formik.setErrors(mapped);
        } else if (typeof err?.message === "string") {
          setGlobalError(err.message);
        } else {
          setGlobalError("Terjadi kesalahan tak terduga. Coba lagi.");
        }
      }
    },
  });

  const addTag = (tag: Tag & { isNew?: boolean }) => {
    if (formik.values.selectedTags.length >= 10) return;
    
    const isDuplicate = formik.values.selectedTags.some(
      (t) => t.name.toLowerCase() === tag.name.toLowerCase() || t.id === tag.id
    );
    if (isDuplicate) return;

    formik.setFieldValue("selectedTags", [...formik.values.selectedTags, tag]);
  };

  const handleAddNewTag = () => {
    const cleanSearch = tagSearch.trim();
    if (!cleanSearch) return;

    const newTagMock: Tag & { isNew: boolean } = {
      id: `new-${Date.now()}`, 
      name: cleanSearch,
      slug: cleanSearch.toLowerCase().replace(/\s+/g, "-"),
      color: "#4a5568", 
      usage_count: 0,
      isNew: true, 
    };

    addTag(newTagMock);
    setTagSearch("");
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    formik.setFieldValue("selectedTags", formik.values.selectedTags.filter((t) => t.id !== tagId));
  };

  const hasEnoughPoints = (user?.reputation_points ?? 0) >= 15;
  const filteredTags = tags.filter(
    (t) => !formik.values.selectedTags.some((s) => s.id === t.id || s.name.toLowerCase() === t.name.toLowerCase())
  );

  if (loading) return null;

  if (isAuthenticated && !hasEnoughPoints) {
    return (
      <main className="insufficient-points-page max-w-2xl mx-auto px-4 py-12">
        <div className="insufficient-points-card border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-sm">
          <div className="insufficient-points-icon text-5xl mb-4">🔒</div>
          <h1 className="insufficient-points-title text-2xl font-bold mb-2">Insufficient Points</h1>
          <p className="insufficient-points-text text-gray-600 dark:text-gray-400 mb-4">
            You need at least <strong style={{ color: "var(--orange)" }}>15 reputation points</strong> to create a post.
          </p>
          <p className="insufficient-points-current mb-6 text-sm">
            Your current points: <strong>{user?.reputation_points ?? 0}</strong>
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary w-full inline-flex justify-center items-center rounded-full border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="create-post-page max-w-2xl mx-auto px-4 py-8">
      <div className="create-post-header mb-8">
        <div className="create-post-header-top mb-4">
          <button type="button" onClick={() => navigate(-1)} className="create-post-header-back text-sm text-gray-500 hover:text-indigo-600 font-semibold">
            &larr; Back
          </button>
        </div>
        <h1 className="create-post-header text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create New Post</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ask a question to the community. Write clearly so it can be answered easily.
        </p>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
          {globalError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="create-post-form space-y-6">

        {/* Category */}
        <div className="form-field flex flex-col">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          {isLoadingMeta ? (
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <select
              id="category"
              name="category_id"
              value={formik.values.category_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-md border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-sm sm:text-sm px-3 py-2.5 text-gray-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              style={{ borderColor: formik.touched.category_id && formik.errors.category_id ? "var(--red)" : undefined }}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_id ? `  ↳ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          )}
          <FieldError message={formik.errors.category_id} />
        </div>

        {/* Title */}
        <div className="form-field flex flex-col">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Write a specific, descriptive title. <span className="font-medium">Minimum {TITLE_MIN} characters.</span>
          </p>
          <label htmlFor="title" className="relative block rounded-md border border-gray-200 dark:border-gray-800 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
            <input
              id="title"
              name="title"
              type="text"
              placeholder=""
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={TITLE_MAX}
              className="peer w-full border-none bg-transparent px-3 py-3 text-sm placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 mt-0.5 rounded text-gray-900 dark:text-white"
              style={{ borderColor: formik.errors.title ? "var(--red)" : undefined }}
            />
            <span className="pointer-events-none absolute inset-y-0 start-3 -translate-y-3.5 bg-white dark:bg-gray-950 px-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-sm peer-focus:-translate-y-3.5 peer-focus:text-xs h-fit leading-none">
              Title <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="flex justify-between items-start">
            <FieldError message={formik.errors.title} />
            <CharHint current={formik.values.title.length} min={TITLE_MIN} max={TITLE_MAX} />
          </div>
        </div>

        {/* Body */}
        <div className="form-field flex flex-col">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Describe your question in detail. <span className="font-medium">Minimum {BODY_MIN} characters.</span> Include what you've tried and what you expect.
          </p>
          <label htmlFor="body" className="relative block rounded-md border border-gray-200 dark:border-gray-800 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
            <textarea
              id="body"
              name="body"
              placeholder=""
              rows={6}
              value={formik.values.body}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="peer w-full border-none bg-transparent px-3 py-3 text-sm placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 mt-0.5 rounded text-gray-900 dark:text-white resize-y"
              style={{ borderColor: formik.errors.body ? "var(--red)" : undefined }}
            />
            <span className="pointer-events-none absolute start-3 top-0 -translate-y-3.5 bg-white dark:bg-gray-950 px-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-sm peer-focus:-translate-y-3.5 peer-focus:text-xs h-fit leading-none">
              Content <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="flex justify-between items-start">
            <FieldError message={formik.errors.body} />
            <CharHint current={formik.values.body.length} min={BODY_MIN} max={99999} />
          </div>
        </div>

        {/* Tags */}
        <div className="form-field flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags <span className="text-gray-400 font-normal">(optional, max 10)</span>
          </label>
          {formik.values.selectedTags.length > 0 && (
            <div className="tags-display flex flex-wrap gap-1.5">
              {formik.values.selectedTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} onRemove={() => removeTag(tag.id)} />
              ))}
            </div>
          )}
          {formik.values.selectedTags.length < 10 && (
            <div className="tags-input-container relative">
              <label htmlFor="tagSearch" className="relative block rounded-md border border-gray-200 dark:border-gray-800 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                <input
                  id="tagSearch"
                  ref={tagInputRef}
                  type="text"
                  placeholder=""
                  value={tagSearch}
                  onChange={(e) => { setTagSearch(e.target.value); setShowTagDropdown(true); }}
                  onFocus={() => setShowTagDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagSearch.trim() !== "") {
                      e.preventDefault();
                      handleAddNewTag();
                    }
                  }}
                  className="peer w-full border-none bg-transparent px-3 py-3 text-sm placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 mt-0.5 rounded text-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute inset-y-0 start-3 -translate-y-3.5 bg-white dark:bg-gray-950 px-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-sm peer-focus:-translate-y-3.5 peer-focus:text-xs h-fit leading-none">
                  Search or type new tag...
                </span>
              </label>
              
              {showTagDropdown && (
                <div ref={tagDropdownRef} className="tags-dropdown absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {/* List Tag dari Database */}
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => { addTag(tag); setTagSearch(""); setShowTagDropdown(false); tagInputRef.current?.focus(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                      <TagBadge tag={tag} />
                      {tag.usage_count > 0 && <span className="text-xs text-gray-400 ml-auto">{tag.usage_count}&times;</span>}
                    </button>
                  ))}

                  {/* Opsi tombol interaktif untuk menambahkan tag buatan sendiri */}
                  {tagSearch.trim() !== "" && (
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-left text-xs text-indigo-600 dark:text-indigo-400 font-medium border-t border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      <span>➕ Tambah tag baru:</span>
                      <span className="font-bold bg-indigo-100 dark:bg-indigo-900 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
                        {tagSearch.trim()}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <hr className="form-divider border-gray-200 dark:border-gray-800" />

        <div className="form-points-info text-sm text-gray-500 dark:text-gray-400">
          <span>⬡ <strong>{user?.reputation_points ?? 0} points</strong></span>
          <span className="ml-1">— minimum 15 points to post</span>
        </div>

        <div className="form-actions flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => { formik.resetForm(); navigate(-1); }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:outline-none dark:hover:bg-indigo-950/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 rtl:rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Create Post</span>
            {isSubmitting
              ? <span className="spinner border-2 border-white border-t-transparent w-4 h-4 rounded-full animate-spin" />
              : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 rtl:rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
            }
          </button>
        </div>
      </form>

      <div className="create-post-tips mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Tips for writing a good post:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>Write a specific and clear title <span className="text-gray-400">(min {TITLE_MIN} chars)</span></li>
          <li>Describe your question in detail <span className="text-gray-400">(min {BODY_MIN} chars)</span></li>
          <li>Provide context: what have you already tried?</li>
          <li>Use relevant tags so it can be easily found</li>
          <li>Choose the appropriate category</li>
        </ul>
      </div>
    </main>
  );
}