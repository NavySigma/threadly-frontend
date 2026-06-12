import { useEffect, useMemo, useState } from "react";
// Import useNavigate untuk pengalihan instan
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";



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

type ApiResponse = {
  summary?: Summary;
  data?: PointHistory[] | { data: PointHistory[] };
};

export default function PointsHistoryPage() {
  // Simpan token di dalam state agar React langsung mendeteksi status login sejak awal render
  const [token] = useState<string | null>(() => localStorage.getItem("token"));
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "earned" | "deducted">("all"); 

  // Efek pengalihan mutlak: Jika token kosong, langsung usir ke halaman login
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // React Query untuk fetch data (hanya jalan jika token ada)
  const { data: result, isLoading } = useQuery<ApiResponse>({
    queryKey: ["pointsHistory", token],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/me/points`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch points history");
      }

      return response.json();
    },
    enabled: !!token,
  });

  // Ekstraksi data summary dengan fallback nilai 0
  const summary: Summary = {
    current_points: result?.summary?.current_points ?? 0,
    total_earned: result?.summary?.total_earned ?? 0,
    total_deducted: result?.summary?.total_deducted ?? 0,
  };

  // Ekstraksi data histories dari API
  const histories = useMemo(() => {
    if (!result) return [];
    if (Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result.data?.data)) {
      return result.data.data;
    }
    return [];
  }, [result]);

  // Filter data (mentoleransi jika ada point berwujud string/angka 0 dari post)
  const filteredHistory = useMemo(() => {
    switch (filter) {
      case "earned":
        return histories.filter((item) => Number(item.points) > 0);

      case "deducted":
        return histories.filter((item) => Number(item.points) < 0);

      default:
        // Tab "All" akan menampilkan semua riwayat, termasuk postingan yang bernilai 0 poin
        return histories;
    }
  }, [histories, filter]);

  // JIKA TIDAK ADA TOKEN: Langsung hentikan render UI dengan mengembalikan null.
  // Ini mencegah browser menampilkan layout halaman setengah jadi sebelum navigasi berjalan.
  if (!token) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Reputation History</h1>

        <p className="mt-2 text-orange-100">
          Riwayat perubahan reputasi akun kamu.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow">
          <p className="text-sm opacity-80">Current Reputation</p>

          <h2 className="mt-2 text-4xl font-bold">{summary.current_points}</h2>
        </div>

        <div className="rounded-2xl bg-green-50 p-6 shadow">
          <p className="text-sm text-gray-500">Total Earned</p>

          <h2 className="mt-2 text-4xl font-bold text-green-600">
            +{summary.total_earned}
          </h2>
        </div>

        <div className="rounded-2xl bg-red-50 p-6 shadow">
          <p className="text-sm text-gray-500">Total Deducted</p>

          <h2 className="mt-2 text-4xl font-bold text-red-500">
            {summary.total_deducted}
          </h2>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "bg-orange-500 text-white"
              : "border bg-white hover:bg-orange-50"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("earned")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "earned"
              ? "bg-orange-500 text-white"
              : "border bg-white hover:bg-orange-50"
          }`}
        >
          Earned
        </button>

        <button
          onClick={() => setFilter("deducted")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "deducted"
              ? "bg-orange-500 text-white"
              : "border bg-white hover:bg-orange-50"
          }`}
        >
          Deducted
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        <div className="grid grid-cols-12 border-b bg-orange-50 px-6 py-4 text-sm font-semibold text-gray-700">
          <div className="col-span-2">Tanggal</div>
          <div className="col-span-8">Aktivitas</div>
          <div className="col-span-2 text-right">Poin</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <span className="text-gray-500">Memuat riwayat poin...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-5xl">📭</div>

            <p className="font-medium text-gray-700">Belum ada riwayat poin</p>

            <p className="mt-1 text-sm text-gray-500">
              Aktivitas reputasi akan muncul di sini.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center border-b px-6 py-4 transition hover:bg-orange-50"
            >
              <div className="col-span-2 text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
              </div>

              <div className="col-span-8">
                <p className="font-medium text-gray-800">{item.description}</p>

                <p className="text-sm text-gray-500">{item.action_type}</p>
              </div>

              <div
                className={`col-span-2 text-right text-lg font-bold ${
                  Number(item.points) > 0
                    ? "text-green-600"
                    : Number(item.points) < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {Number(item.points) > 0
                  ? `+${item.points}`
                  : item.points}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}