import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Search, RotateCw, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../../lib/axios";

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_points: number;
}

export default function RecalculateReputationPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAdmin = user?.roles?.some((r) => r.name === "admin");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setMessage(null);
    setHasSearched(true);
    try {
      const res = await axiosInstance.get<{ data: UserResult[] }>("/users", {
        params: { search: query, per_page: 10 },
      });
      setUsers(res.data.data ?? []);
      if (res.data.data?.length === 0) {
        setMessage({ type: "error", text: "User tidak ditemukan." });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal mencari user." });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRecalculate = async (userId: string) => {
    setRecalcLoading(userId);
    setMessage(null);
    try {
      const res = await axiosInstance.post<{ message: string; reputation_points: number }>(
        `/users/${userId}/points/recalculate`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, reputation_points: res.data.reputation_points } : u
        )
      );
      setMessage({ type: "success", text: res.data.message });
    } catch {
      setMessage({ type: "error", text: "Gagal rekalkulasi." });
    } finally {
      setRecalcLoading(null);
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-sm">Akses ditolak. Hanya untuk Admin.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="home-header">
        <h1>Rekalkulasi Reputasi</h1>
        <span className="text-sm text-gray-500">Hitung ulang poin reputasi user</span>
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
          disabled={searchLoading || !query.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searchLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search size={16} />
          )}
          Cari
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {!hasSearched && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16">
          <Search size={40} className="text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">Silakan cari user terlebih dahulu</p>
        </div>
      )}

      {hasSearched && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-sm font-bold text-white">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.username}</p>
                  <p className="text-xs text-gray-400">ID: {u.id.slice(0, 14)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Reputasi</p>
                  <p className="text-sm font-bold text-[#0d9488]">{u.reputation_points ?? "?"}</p>
                </div>
                <button
                  onClick={() => handleRecalculate(u.id)}
                  disabled={recalcLoading === u.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-[#0d9488] hover:text-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCw
                    size={16}
                    className={recalcLoading === u.id ? "animate-spin" : ""}
                  />
                  {recalcLoading === u.id ? "Proses..." : "Rekalkulasi"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
