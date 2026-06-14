import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import UserCard, { type UserItem } from "./UserCard";
import { getToken } from "../../api/client";

type SortOption = "reputation" | "newest" | "name";

interface UsersMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface UsersResponse {
  data: UserItem[];
  meta: UsersMeta;
}

async function fetchUsers(params: {
  page: number;
  search: string;
  sort: SortOption;
}): Promise<UsersResponse> {
  const token = getToken();
  const query = new URLSearchParams({
    page: String(params.page),
    sort: params.sort,
    ...(params.search ? { search: params.search } : {}),
  });

  const res = await fetch(`/api/users?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error("Gagal memuat data users");
  return res.json();
}

function UserCardSkeleton() {
  return (
    <div className="user-card user-card-skeleton">
      <div className="user-card-avatar" style={{ background: "var(--black-100)" }} />
      <div className="user-card-info" style={{ gap: 6 }}>
        <div style={{ height: 14, width: "60%", background: "var(--black-100)", borderRadius: 4 }} />
        <div style={{ height: 12, width: "40%", background: "var(--black-100)", borderRadius: 4 }} />
        <div style={{ height: 11, width: "50%", background: "var(--black-100)", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function UsersPage() {
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
  const meta = data?.meta ?? { current_page: 1, last_page: 1, total: 0 };

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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <input
          type="text"
          placeholder="Filter by user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="users-search-input"
        />
        <div className="filter-bar">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              className={`filter-btn${sort === opt.value ? " active" : ""}`}
              onClick={() => { setSort(opt.value); setPage(1); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && !isError && (
        <p style={{ fontSize: 13, color: "var(--black-500)", marginBottom: 12 }}>
          {meta.total.toLocaleString()} users
        </p>
      )}

      {isError && (
        <div style={{ padding: "12px 16px", background: "#fee", border: "1px solid #f99", borderRadius: 4, color: "#c0392b", fontSize: 13, marginBottom: 16 }}>
          {error instanceof Error ? error.message : "Terjadi kesalahan"}
        </div>
      )}

      {isLoading ? (
        <div className="users-grid">
          {Array.from({ length: 12 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--black-500)" }}>
          <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>
            {debouncedSearch ? `Tidak ada user dengan nama "${debouncedSearch}"` : "Belum ada user terdaftar."}
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((u) => <UserCard key={u.id} user={u} />)}
        </div>
      )}

      {!isLoading && meta.last_page > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
          <button
            className="filter-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          {Array.from({ length: meta.last_page }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && arr[idx - 1] !== p - 1;
              return (
                <span key={p} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  {showEllipsis && <span style={{ padding: "4px 8px", color: "var(--black-500)" }}>…</span>}
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
            className="filter-btn"
            disabled={page === meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}