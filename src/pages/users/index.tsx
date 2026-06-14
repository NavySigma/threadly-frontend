import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserCard, { type UserItem } from "./UserCard";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/useAuth";

type SortOption = "reputation" | "newest" | "name";

interface UsersResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: UserItem[];
}

async function fetchUsers(params: {
  page: number;
  search: string;
  sort: SortOption;
}): Promise<UsersResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    sort: params.sort,
    ...(params.search ? { search: params.search } : {}),
  });

  return apiFetch(`/users?${query}`);
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3.5 w-3/5 bg-gray-100 rounded" />
        <div className="h-3 w-2/5 bg-gray-100 rounded" />
        <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("reputation");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page, debouncedSearch, sort],
    queryFn: () => fetchUsers({ page, search: debouncedSearch, sort }),
    placeholderData: (prev) => prev,
  });

  const users = data?.data ?? [];
  const meta = {
    current_page: data?.current_page ?? 1,
    last_page: data?.last_page ?? 1,
    total: data?.total ?? 0,
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "reputation", label: "Reputation" },
    { value: "newest", label: "Newest" },
    { value: "name", label: "Name" },
  ];

  return (
    <div>
      <div className="home-header">
        <h1>Users</h1>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-sans w-60 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
            />
          </div>
          <div className="filter-bar">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                className={`filter-btn${sort === opt.value ? " active" : ""}`}
                onClick={() => {
                  setSort(opt.value);
                  setPage(1);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!isLoading && !isError && (
          <p className="text-sm text-gray-400 mb-3">
            <span className="font-semibold text-gray-600">{meta.total.toLocaleString()}</span> users
          </p>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
            {error instanceof Error ? error.message : "Terjadi kesalahan"}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 bg-white border border-gray-200 rounded-xl">
            <Users size={36} className="text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">
              {debouncedSearch
                ? `Tidak ada user dengan nama "${debouncedSearch}"`
                : "Belum ada user terdaftar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {users.map((u) => (
              <UserCard key={u.id} user={u} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}

        {!isLoading && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
            <button
              className="filter-btn flex items-center gap-1"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} /> Prev
            </button>

            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === meta.last_page || Math.abs(p - page) <= 2
              )
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && arr[idx - 1] !== p - 1;
                return (
                  <span key={p} className="inline-flex gap-1.5 items-center">
                    {showEllipsis && (
                      <span className="px-2 py-1 text-gray-400 text-sm">…</span>
                    )}
                    <button
                      className={`filter-btn${p === page ? " active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              className="filter-btn flex items-center gap-1"
              disabled={page === meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
  );
}
