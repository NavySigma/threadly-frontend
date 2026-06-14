import { Link } from "react-router-dom";
import type { Category, PaginationMeta } from "../../types/category.types";

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="Search categories…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none w-full focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
    </div>
  );
}

// ─── CategoryCard ─────────────────────────────────────────────────────────────

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/posts?category_id=${category.id}`}
      className="border border-teal-500 rounded-xl bg-white shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow"
    >
      <span className="text-base font-bold text-blue-600 hover:text-blue-500 transition-colors">
        {category.name}
      </span>
      <p className="text-xs text-gray-500 mt-1.5 mb-3 line-clamp-2">
        {category.description ?? "Tidak ada deskripsi."}
      </p>
      {category.children && category.children.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {category.children.slice(0, 4).map((child) => (
            <span key={child.id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {child.name}
            </span>
          ))}
          {category.children.length > 4 && (
            <span className="text-[11px] text-gray-400">+{category.children.length - 4}</span>
          )}
        </div>
      )}
      {category.posts_count !== undefined && (
        <span className="text-xs text-teal-600 font-medium mt-auto self-end pt-3">
          {category.posts_count} questions
        </span>
      )}
    </Link>
  );
}

// ─── CategoryCardSkeleton ─────────────────────────────────────────────────────

export function CategoryCardSkeleton() {
  return (
    <div className="border border-teal-500 rounded-xl bg-white p-4 flex flex-col min-h-[110px] animate-pulse">
      <div className="w-1/2 h-5 bg-gray-200 rounded" />
      <div className="w-full h-3 bg-gray-200 rounded mt-2" />
      <div className="w-1/3 h-3 bg-gray-200 rounded mt-auto self-end" />
    </div>
  );
}

// ─── EmptyCategories ──────────────────────────────────────────────────────────

export function EmptyCategories({ search }: { search: string }) {
  return (
    <div className="col-span-full p-12 text-center text-gray-500 text-sm">
      {search ? `No categories found matching "${search}".` : "No categories available."}
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="col-span-full p-6 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm">
      {message}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (p: number) => void }) {
  if (meta.last_page <= 1) return null;

  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 2
  );

  return (
    <div className="flex justify-center gap-1 mt-8 flex-wrap">
      <button
        className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100"
        disabled={meta.current_page === 1}
        onClick={() => onPageChange(meta.current_page - 1)}
      >
        ← Prev
      </button>
      {pages.map((p, idx, arr) => {
        const gap = idx > 0 && arr[idx - 1] !== p - 1;
        return (
          <span key={p} className="inline-flex gap-1 items-center">
            {gap && <span className="px-1 text-gray-400">…</span>}
            <button
              className={`px-2.5 py-1 text-xs border rounded ${
                p === meta.current_page
                  ? "bg-teal-600 text-white border-teal-600 font-bold"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => p !== meta.current_page && onPageChange(p)}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
