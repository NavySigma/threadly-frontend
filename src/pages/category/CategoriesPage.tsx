import { useState, useMemo } from "react";
import { useCategories } from "../../hooks";
import { Link } from "react-router-dom";

const PER_PAGE = 12;

function CardSkeleton() {
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

const CategoriesPage = () => {
  const { categories, isLoading, error } = useCategories();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, lastPage);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  return (
    <div className="max-w-[1100px] w-full">
      <h1 className="text-[28px] font-bold mb-2">Categories</h1>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        Jelajahi berbagai kategori untuk menemukan pertanyaan yang sesuai
        dengan minat Anda.
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
            placeholder="Filter by category name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 pr-3 py-2 text-xs border border-gray-400 rounded outline-none transition-[border-color] focus:border-[#0d9488] w-[220px]"
          />
        </div>
      </div>

      {error ? (
        <div className="p-6 border border-red-300 rounded-lg bg-red-100 text-red-800">
          Terjadi kesalahan saat memuat kategori. Silakan coba lagi.
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
              : paginated.map((category) => (
                  <div
                    key={category.id}
                    className="border border-[#0d9488] rounded-xl bg-white shadow-sm p-4 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/posts?category_id=${category.id}`}
                      className="text-base font-bold text-[#0074cc] hover:text-[#0a95ff] transition-colors"
                    >
                      {category.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1.5 mb-3 line-clamp-2">
                      {category.description || "Tidak ada deskripsi."}
                    </p>

                    {category.children && category.children.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {category.children.slice(0, 4).map((child) => (
                          <Link
                            key={child.id}
                            to={`/posts?category_id=${child.id}`}
                            className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                        {category.children.length > 4 && (
                          <span className="text-[11px] text-gray-400">
                            +{category.children.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-xs text-[#0d9488] font-medium mt-auto self-end pt-3">
                      Lihat selengkapnya &raquo;
                    </span>
                  </div>
                ))}
          </div>

          {!isLoading && paginated.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Tidak ada kategori yang sesuai dengan filter Anda.
            </div>
          )}

          {!isLoading && total > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-xs text-gray-500">
                Menampilkan {paginated.length} dari {total.toLocaleString()}{" "}
                kategori
              </div>
              <Pagination
                current={currentPage}
                last={lastPage}
                onPage={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
