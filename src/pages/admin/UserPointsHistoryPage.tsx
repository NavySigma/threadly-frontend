import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Coins } from "lucide-react";
import axiosInstance from "../../lib/axios";

type PointHistory = {
  id: number;
  action_type: string;
  description: string;
  points: number;
  created_at: string;
};

type Summary = {
  current_points: number;
  total_earned: number;
  total_deducted: number;
};

type UserInfo = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type ApiResponse = {
  user: UserInfo;
  summary: Summary;
  data: { data: PointHistory[] };
};

function formatNumber(n: number): string {
  return n.toLocaleString("id-ID");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

const ACTION_LABELS: Record<string, string> = {
  create_post: "Membuat post",
  create_comment: "Membuat komentar",
  accept_answer: "Jawaban diterima",
  upvote_received: "Mendapat upvote",
  content_reported: "Konten dilaporkan",
};

export default function UserPointsHistoryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchedUserId, setSearchedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "deducted">("all");
  const [page, setPage] = useState(1);

  const isAdmin = user?.roles?.some((r) => r.name === "admin");

  const { data, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey: ["admin-user-points", searchedUserId],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse>(`/users/${searchedUserId}/points`);
      return res.data;
    },
    enabled: !!searchedUserId,
  });

  const userInfo = data?.user;
  const summary = data?.summary ?? { current_points: 0, total_earned: 0, total_deducted: 0 };
  const allHistories = useMemo(() => {
    if (!data?.data?.data) return [];
    return data.data.data;
  }, [data]);

  const filteredHistories = useMemo(() => {
    return allHistories.filter((h) => {
      if (filter === "earned") return h.points > 0;
      if (filter === "deducted") return h.points < 0;
      return true;
    });
  }, [allHistories, filter]);

  const PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredHistories.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredHistories.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await axiosInstance.get<{ data: { id: string; username: string }[] }>("/users", {
        params: { search: query, per_page: 1 },
      });
      const found = res.data.data?.[0];
      if (found) {
        setSearchedUserId(found.id);
        setPage(1);
      } else {
        setSearchedUserId("__notfound__");
      }
    } catch {
      setSearchedUserId("__notfound__");
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="home-header">
        <h1>Riwayat Poin User</h1>
        <span className="text-sm text-gray-500">Lihat history poin user lain</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari user berdasarkan username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          Cari
        </button>
      </div>

      {searchedUserId === "__notfound__" && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          User tidak ditemukan.
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat riwayat poin...</p>
        </div>
      )}

      {data && userInfo && (
        <>
          <div className="flex items-center gap-3 mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {userInfo.avatar_url ? (
              <img src={userInfo.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-sm font-bold text-white">
                {userInfo.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{userInfo.username}</p>
              <p className="text-xs text-gray-400">ID: {userInfo.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <Coins size={20} className="mx-auto mb-1 text-[#0d9488]" />
              <p className="text-2xl font-bold text-[#0d9488]">{formatNumber(summary.current_points)}</p>
              <p className="text-xs text-gray-400">Poin Saat Ini</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <TrendingUp size={20} className="mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.total_earned)}</p>
              <p className="text-xs text-gray-400">Total Diperoleh</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <TrendingDown size={20} className="mx-auto mb-1 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{formatNumber(Math.abs(summary.total_deducted))}</p>
              <p className="text-xs text-gray-400">Total Dikurangi</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {(["all", "earned", "deducted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "bg-[#0d9488] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#0d9488]"
                }`}
              >
                {f === "all" ? "Semua" : f === "earned" ? "Diperoleh" : "Dikurangi"}
              </button>
            ))}
          </div>

          {isFetching ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
              Belum ada riwayat poin.
            </div>
          ) : (
            <div className="space-y-2">
              {paginated.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                        h.points > 0
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {h.points > 0 ? "+" : ""}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {ACTION_LABELS[h.action_type] ?? h.action_type}
                      </p>
                      {h.description && (
                        <p className="text-xs text-gray-400">{h.description}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(h.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      h.points > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {h.points > 0 ? "+" : ""}{h.points}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Halaman {safePage} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let num: number;
                  if (totalPages <= 5) num = i + 1;
                  else if (safePage <= 3) num = i + 1;
                  else if (safePage >= totalPages - 2) num = totalPages - 4 + i;
                  else num = safePage - 2 + i;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        num === safePage
                          ? "bg-[#0d9488] text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-[#0d9488] hover:text-[#0d9488]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!searchedUserId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16">
          <Search size={40} className="text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">Silakan cari user terlebih dahulu</p>
        </div>
      )}
    </div>
  );
}
