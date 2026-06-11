// src/pages/posts/EditPostPage.tsx
import type { Tag } from "../../types/posts";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditPost } from "../../hooks/useEditPost";
import { useAuth } from "../../hooks/useAuth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
      <span aria-hidden>⚠</span> {message}
    </p>
  );
}

function TagBadge({
  tag,
  onRemove,
  onClick,
}: {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: tag.color ?? "#6366f1" }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Hapus tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  const {
    form,
    originalPost,
    categories,
    tags,
    tagSearch,
    isLoadingMeta,
    isLoadingPost,
    isSubmitting,
    errors,
    globalError,
    setField,
    setTagSearch,
    addTag,
    removeTag,
    submit,
  } = useEditPost(id!);

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect kalau belum login
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login", { replace: true });
  }, [loading, isAuthenticated, navigate]);

  // Guard: hanya pemilik post yang boleh edit
  useEffect(() => {
    if (!isLoadingPost && originalPost && user) {
      if (originalPost.user.id !== user.id) {
        navigate("/", { replace: true });
      }
    }
  }, [isLoadingPost, originalPost, user, navigate]);

  // Tutup dropdown kalau klik di luar
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await submit();
    if (ok) navigate(`/posts/${id}`);
  }

  // Loading state
  if (isLoadingPost) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Post tidak ditemukan
  if (!originalPost) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="text-5xl">🔍</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Postingan tidak ditemukan
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  const filteredTags = tags.filter(
    (t) => !form.selectedTags.some((s) => s.id === t.id),
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-indigo-500 transition-colors flex items-center gap-1 mb-4"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Postingan
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            Perbarui postingan kamu agar lebih jelas dan informatif.
          </p>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {globalError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8"
        >
          {/* Kategori */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5"
            >
              Kategori <span className="text-red-500">*</span>
            </label>
            {isLoadingMeta ? (
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                  errors.category_id
                    ? "border-red-400"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent_id ? `  ↳ ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            )}
            <FieldError message={errors.category_id} />
          </div>

          {/* Judul */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5"
            >
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Contoh: Bagaimana cara menggunakan useEffect di React?"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={300}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                errors.title
                  ? "border-red-400"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
            <div className="mt-1 flex justify-between">
              <FieldError message={errors.title} />
              <span className="text-xs text-gray-400 ml-auto">
                {form.title.length}/300
              </span>
            </div>
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="body"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5"
            >
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              id="body"
              rows={10}
              placeholder="Jelaskan pertanyaan atau masalah kamu secara detail..."
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-y ${
                errors.body
                  ? "border-red-400"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
            <div className="mt-1 flex justify-between">
              <FieldError message={errors.body} />
              <span className="text-xs text-gray-400 ml-auto">
                {form.body.length} karakter
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
              Tags{" "}
              <span className="text-gray-400 font-normal">
                (opsional, maks. 5)
              </span>
            </label>

            {form.selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.selectedTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onRemove={() => removeTag(tag.id)}
                  />
                ))}
              </div>
            )}

            {form.selectedTags.length < 5 && (
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Cari tag..."
                  value={tagSearch}
                  onChange={(e) => {
                    setTagSearch(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />

                {showTagDropdown && filteredTags.length > 0 && (
                  <div
                    ref={tagDropdownRef}
                    className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          addTag(tag);
                          setTagSearch("");
                          setShowTagDropdown(false);
                          tagInputRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                      >
                        <TagBadge tag={tag} />
                        {tag.usage_count > 0 && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {tag.usage_count}×
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showTagDropdown &&
                  filteredTags.length === 0 &&
                  tagSearch.length > 0 && (
                    <div
                      ref={tagDropdownRef}
                      className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400"
                    >
                      Tag "{tagSearch}" tidak ditemukan.
                    </div>
                  )}
              </div>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
