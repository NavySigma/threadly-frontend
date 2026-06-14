import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface EditHistoryItem {
  id: string;
  type: "post" | "comment";
  title: string | null;
  author: string | null;
  editor: string | null;
  editor_avatar: string | null;
  body_before: string;
  body_after: string;
  reason: string | null;
  edited_at: string;
}

interface EditHistoryResponse {
  data: EditHistoryItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

type TypeFilter = "all" | "post" | "comment";

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const typeLabels: Record<TypeFilter, string> = {
  all: "Semua",
  post: "Postingan",
  comment: "Komentar",
};

export default function EditHistoryPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(today);

  const isAdminOrMod = user?.roles?.some((r) =>
    ["admin", "moderator"].includes(r.name)
  );

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", "20");
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (dateFilter) params.set("date", dateFilter);

  const { data, isLoading } = useQuery<EditHistoryResponse>({
    queryKey: ["admin-edit-history", page, typeFilter, dateFilter],
    queryFn: () =>
      apiFetch<EditHistoryResponse>(`/admin/edit-history?${params}`),
    enabled: !!isAdminOrMod,
    staleTime: 30 * 1000,
  });

  const handleTypeChange = (t: TypeFilter) => {
    setTypeFilter(t);
    setPage(1);
  };

  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setPage(1);
  };

  const clearDate = () => {
    setDateFilter("");
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminOrMod) return <Navigate to="/" replace />;

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="home-header">
        <h1>Edit History</h1>
        <span className="text-sm text-gray-500">
          {meta?.total ?? "-"} riwayat edit
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          {(Object.keys(typeLabels) as TypeFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTypeChange(key)}
              className={`px-4 py-2 text-sm font-medium transition ${
                typeFilter === key
                  ? "bg-teal-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              } ${key !== "all" ? "border-l border-gray-200" : ""}`}
            >
              {typeLabels[key]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          {dateFilter && (
            <button
              onClick={clearDate}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Memuat riwayat edit...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-500">
          Belum ada riwayat edit.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.type === "post"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {item.type === "post" ? "Postingan" : "Komentar"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.title ?? "(tanpa judul)"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {item.editor_avatar ? (
                    <img
                      src={item.editor_avatar}
                      alt={item.editor ?? ""}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {item.editor?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <span>
                    <span className="font-medium text-gray-700">
                      {item.editor ?? "?"}
                    </span>{" "}
                    mengedit{" "}
                    <span className="font-medium text-gray-700">
                      {item.author ?? "?"}
                    </span>
                  </span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(item.edited_at)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="p-5">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2 block">
                    Sebelum
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {item.body_before}
                  </p>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-2 block">
                    Sesudah
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {item.body_after}
                  </p>
                </div>
              </div>
              {item.reason && (
                <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                  Alasan: <span className="italic">{item.reason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="filter-btn"
            disabled={meta.current_page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="flex items-center px-3 text-sm text-gray-600">
            {meta.current_page} / {meta.last_page}
          </span>
          <button
            className="filter-btn"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
