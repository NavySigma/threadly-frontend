import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { Tag, TagsParams } from "../../../api/tags";
import { getTagColor } from "../../../lib/tagColor";

type TagsViewProps = {
  tags: Tag[];
  currentPage: number;
  lastPage: number;
  total: number;
  isLoading: boolean;
  error: unknown;
  search: string;
  sort: TagsParams["sort"];
  onSearch: (value: string) => void;
  onSort: (sort: TagsParams["sort"]) => void;
  onPage: (page: number) => void;
  isAdmin?: boolean;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
};

function TagCard({
  tag,
  isAdmin,
  onEdit,
  onDelete,
}: {
  tag: Tag;
  isAdmin?: boolean;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
}) {
  const navigate = useNavigate();
  const color = getTagColor(tag);

  return (
    <div
      onClick={() => navigate(`/posts?tag_id=${tag.id}`)}
      className="relative border border-[#0d9488] rounded-xl bg-white shadow-sm p-4 flex flex-col min-h-[110px] cursor-pointer hover:shadow-md transition-shadow"
    >
      {isAdmin && onEdit && onDelete && (
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tag);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-teal-600 shadow-sm transition hover:bg-teal-50 hover:text-teal-700"
            title="Edit tag"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tag);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
            title="Hapus tag"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <span
        className="px-2.5 py-1 text-xs font-bold rounded-md self-start"
        style={{
          backgroundColor: `${color}22`,
          color: color,
          border: `1px solid ${color}`,
        }}
      >
        <span style={{ filter: "brightness(0.45) saturate(1.8)" }}>
          {tag.name}
        </span>
      </span>

      <span className="text-xs text-gray-500 mt-2">
        {(tag.usage_count ?? tag.posts_count ?? 0).toLocaleString()} pertanyaan
      </span>

      <span className="text-xs text-[#0d9488] font-medium mt-auto self-end">
        Lihat selengkapnya &raquo;
      </span>
    </div>
  );
}

function TagSkeleton() {
  return (
    <div className="border border-[#0d9488] rounded-xl bg-white p-4 flex flex-col min-h-[110px] animate-pulse">
      <div className="w-1/2 h-5 bg-gray-200 rounded" />
      <div className="w-full h-3 bg-gray-200 rounded mt-2" />
      <div className="w-1/3 h-3 bg-gray-200 rounded mt-auto self-end" />
    </div>
  );
}

function Pagination({
  current,
  last,
  onPage,
}: {
  current: number;
  last: number;
  onPage: (p: number) => void;
}) {
  if (last <= 1) return null;

  const pages = Array.from({ length: last }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === last || Math.abs(p - current) <= 2,
  );

  return (
    <div className="flex justify-center gap-1 mt-8 flex-wrap">
      <button
        className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        disabled={current === 1}
        onClick={() => onPage(current - 1)}
      >
        ← Prev
      </button>

      {pages.map((p, idx, arr) => {
        const gap = idx > 0 && arr[idx - 1] !== p - 1;
        return (
          <span key={p} className="inline-flex gap-1 items-center">
            {gap && <span className="px-1 py-1 text-gray-500">…</span>}
            <button
              className={`px-2.5 py-1 text-xs border border-gray-300 rounded ${
                p === current
                  ? "bg-[#0d9488] text-white font-bold border-[#0d9488]"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => p !== current && onPage(p)}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        disabled={current === last}
        onClick={() => onPage(current + 1)}
      >
        Next →
      </button>
    </div>
  );
}

export default function TagsView({
  tags,
  currentPage,
  lastPage,
  total,
  isLoading,
  error,
  search,
  sort,
  onSearch,
  onSort,
  onPage,
  isAdmin,
  onEdit,
  onDelete,
}: TagsViewProps) {
  return (
    <div className="max-w-[1100px] w-full">
      <h1 className="text-[28px] font-bold mb-2">Tags</h1>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        Tag adalah kata kunci atau label yang mengkategorikan pertanyaan Anda
        dengan pertanyaan serupa. Menggunakan tag yang tepat membuat pertanyaan
        lebih mudah ditemukan.
      </p>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Filter by tag name"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-gray-400 rounded outline-none transition-[border-color] focus:border-[#0d9488] w-[220px]"
          />
        </div>

        <div className="flex border border-gray-300 rounded overflow-hidden">
          {(["popular", "name", "new"] as TagsParams["sort"][]).map((s) => (
            <button
              key={s}
              onClick={() => onSort(s)}
              className={`px-3.5 py-1.5 text-xs border-r last:border-r-0 cursor-pointer ${
                sort === s
                  ? "bg-gray-200 font-bold text-gray-700"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s === "popular" ? "Popular" : s === "name" ? "Name" : "New"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-6 border border-red-300 rounded-lg bg-red-100 text-red-800">
          Terjadi kesalahan saat memuat tag. Silakan coba lagi.
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-5">
            {isLoading
              ? Array.from({ length: 8 }, (_, idx) => <TagSkeleton key={idx} />)
              : tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
          </div>

          {!isLoading && tags.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Tidak ada tag yang sesuai dengan filter Anda.
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-xs text-gray-500">
              Menampilkan {tags.length} dari {total.toLocaleString()} tag
            </div>
            <Pagination current={currentPage} last={lastPage} onPage={onPage} />
          </div>
        </>
      )}
    </div>
  );
}
