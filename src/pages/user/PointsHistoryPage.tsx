// src/pages/posts/PointsHistoryPage.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────
export type PointTabFilter = "all" | "answer" | "question" | "bonus";
export type PeriodFilter   = "all" | "7" | "30";
export type PointIconType  =
  | "upvote-answer"
  | "accepted"
  | "upvote-question"
  | "downvote"
  | "bonus"
  | "badge"
  | "bounty";

export interface PointEvent {
  id: number;
  date: string;
  tab: Exclude<PointTabFilter, "all">;
  icon: PointIconType;
  pts: number;
  label: string;
  meta: string;
  tags: string[];
  votes: number | null;
}

interface DayGroup {
  date: string;
  items: PointEvent[];
  net: number;
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA & SIMULASI API
// ─────────────────────────────────────────────────────────────
const MOCK_POINTS_DATA: PointEvent[] = [
  { id: 1, date: "2026-06-09", tab: "answer",   icon: "upvote-answer",   pts: 10, label: "Kenapa useState tidak langsung mengupdate nilai state saat di-console?", meta: "upvote jawaban",    tags: ["react", "typescript"], votes: 14 },
  { id: 2, date: "2026-06-09", tab: "answer",   icon: "accepted",        pts: 15, label: "Cara melakukan parsing JSON nested besar di Python dengan aman",       meta: "jawaban diterima",   tags: ["python"],              votes: 9  },
  { id: 3, date: "2026-06-05", tab: "question", icon: "upvote-question", pts: 5,  label: "Bagaimana arsitektur event loop menangani async I/O di Node.js?",      meta: "upvote pertanyaan", tags: ["nodejs", "javascript"],votes: 22 },
];

const fetchPointsData = async (tab: PointTabFilter, period: PeriodFilter, search: string): Promise<PointEvent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_POINTS_DATA.filter((event) => {
    const matchTab = tab === "all" || event.tab === tab;
    const parsedDate = new Date(event.date).getTime();
    const diffTime = Date.now() - parsedDate;
    const daysAgo = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const matchPeriod = period === "all" || daysAgo <= parseInt(period, 10);
    const matchQuery = !search || event.label.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchPeriod && matchQuery;
  });
};

const claimBonusCodeApi = async (code: string): Promise<PointEvent> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (code === "REACT2026") {
    return {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      tab: "bonus",
      icon: "bonus",
      pts: 50,
      label: `Klaim sukses kode promo event: ${code}`,
      meta: "Bonus Event Eksternal",
      tags: ["promo", "event"],
      votes: null
    };
  }
  throw new Error("Kode bonus tidak valid atau sudah kedaluwarsa!");
};

// ─────────────────────────────────────────────────────────────
// CONFIGURATIONS & STYLES
// ─────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 4;
const TOTAL_WEEKS = 12;

const TAB_OPTIONS: { label: string; value: PointTabFilter }[] = [
  { label: "Semua Aktivitas", value: "all" },
  { label: "Jawaban",         value: "answer" },
  { label: "Pertanyaan",      value: "question" },
  { label: "Bonus & Reward",  value: "bonus" },
];

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: "Semua Waktu", value: "all" },
  { label: "30 Hari Terakhir", value: "30" },
  { label: "7 Hari Terakhir", value: "7" },
];

const ICON_THEMES: Record<PointIconType, { color: string; symbol: string; bg: string }> = {
  "upvote-answer":   { color: "#10b981", symbol: "▲", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  "accepted":        { color: "#059669", symbol: "✔", bg: "bg-green-50 dark:bg-green-950/40" },
  "upvote-question": { color: "#3b82f6", symbol: "▲", bg: "bg-blue-50 dark:bg-blue-950/30" },
  "downvote":        { color: "#ef4444", symbol: "▼", bg: "bg-red-50 dark:bg-red-950/30" },
  "bonus":           { color: "#f97316", symbol: "★", bg: "bg-orange-50 dark:bg-orange-950/30" },
  "badge":           { color: "#f59e0b", symbol: "●", bg: "bg-amber-50 dark:bg-amber-950/30" },
  "bounty":          { color: "#8b5cf6", symbol: "✦", bg: "bg-purple-50 dark:bg-purple-950/30" },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const formatLongDate = (dateString: string): string => {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? dateString : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const formatShortDate = (date: Date): string =>
  date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function groupEventsByDate(events: PointEvent[]): DayGroup[] {
  const groupsMap: Record<string, PointEvent[]> = {};
  for (const item of events) {
    if (!groupsMap[item.date]) groupsMap[item.date] = [];
    groupsMap[item.date].push(item);
  }
  return Object.entries(groupsMap)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, items]) => ({
      date,
      items,
      net: items.reduce((sum, item) => sum + item.pts, 0),
    }));
}

function SparklineChart({ points }: { points: number[] }) {
  const maxPoint = Math.max(...points, 1);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
        Tren Akumulasi Poin (12 Minggu Terakhir)
      </h3>
      <div className="flex items-end gap-3 h-20 pt-4 px-2">
        {points.map((value, idx) => {
          const percentageHeight = Math.max(Math.round((value / maxPoint) * 100), 6);
          const calculatedDate = new Date(Date.now() - (TOTAL_WEEKS - 1 - idx) * 7 * 24 * 60 * 60 * 1000);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-semibold rounded px-2 py-0.5 pointer-events-none whitespace-nowrap z-10 shadow-md">
                +{value} pts
              </div>
              <div 
                className={`w-full rounded-t-md transition-all duration-300 ${
                  value > 0 ? "bg-indigo-500 dark:bg-indigo-600 shadow-xs shadow-indigo-500/20" : "bg-gray-100 dark:bg-gray-800"
                }`}
                style={{ height: `${percentageHeight}%` }} 
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 whitespace-nowrap">
                {idx % 3 === 0 ? formatShortDate(calculatedDate) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function PointsHistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<PointTabFilter>("all");
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showBonusForm, setShowBonusForm] = useState<boolean>(false);
  const [successClaimMsg, setSuccessClaimMsg] = useState<string | null>(null);

  const [bonusCodeInput, setBonusCodeInput] = useState<string>(" ");
  const [formError, setFormError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: filteredEvents = [], isLoading, isFetching } = useQuery({
    queryKey: ["pointsHistory", activeTab, activePeriod, searchQuery],
    queryFn: () => fetchPointsData(activeTab, activePeriod, searchQuery),
    placeholderData: (previousData) => previousData,
  });

  const mutation = useMutation({
    mutationFn: claimBonusCodeApi,
    onSuccess: (newEvent) => {
      MOCK_POINTS_DATA.unshift(newEvent);
      queryClient.invalidateQueries({ queryKey: ["pointsHistory"] });
      setSuccessClaimMsg("Selamat! Anda berhasil mengklaim +50 Reputasi poin!");
      setBonusCodeInput("");
      setFormError(null);
      setTimeout(() => setSuccessClaimMsg(null), 4000);
    },
    onError: (error: any) => {
      setFormError(error.message);
    }
  });

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccessClaimMsg(null);

    const trimmedCode = bonusCodeInput.trim();

    if (trimmedCode.length < 5) {
      setFormError("Kode bonus minimal berisikan 5 karakter");
      return;
    }
    if (trimmedCode.length > 20) {
      setFormError("Kode bonus maksimal 20 karakter");
      return;
    }
    
    const validPattern = /^[A-Z0-9_-]+$/;
    if (!validPattern.test(trimmedCode)) {
      setFormError("Kode hanya boleh huruf kapital, angka, strip (-), atau underscore (_)");
      return;
    }

    mutation.mutate(trimmedCode);
  };

  const changeTab = (tab: PointTabFilter) => { setActiveTab(tab); setCurrentPage(1); };
  const changePeriod = (period: PeriodFilter) => { setActivePeriod(period); setCurrentPage(1); };
  const changeSearch = (query: string) => { setSearchQuery(query); setCurrentPage(1); };

  const groupedEvents = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents]);
  const totalPages = Math.max(1, Math.ceil(groupedEvents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedGroups = groupedEvents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const summaryStats = useMemo(() => {
    return MOCK_POINTS_DATA.reduce(
      (acc, event) => {
        if (event.pts > 0) acc.grandTotal += event.pts;
        if (event.icon === "upvote-answer" || event.icon === "accepted") acc.answersTotal += event.pts;
        if (event.icon === "upvote-question") acc.questionsTotal += event.pts;
        if (event.icon === "bonus" || event.icon === "badge" || event.icon === "bounty") acc.rewardsTotal += event.pts;
        if (event.pts < 0) acc.deductionsTotal += event.pts;
        return acc;
      },
      { grandTotal: 0, answersTotal: 0, questionsTotal: 0, rewardsTotal: 0, deductionsTotal: 0 }
    );
  }, [filteredEvents]);

  // LOGIKA DINAMIS CARD LEVEL REPUTASI (Card Baru)
  const currentLevelInfo = useMemo(() => {
    const total = summaryStats.grandTotal;
    if (total < 50) return { name: "Contributor Pemula", next: 50, icon: "🌱", color: "from-blue-500 to-cyan-500" };
    if (total < 200) return { name: "Elite Developer", next: 200, icon: "🚀", color: "from-indigo-500 to-purple-500" };
    return { name: "Master Guru", next: 1000, icon: "👑", color: "from-amber-500 to-orange-500" };
  }, [summaryStats.grandTotal]);

  const progressPercentage = useMemo(() => {
    return Math.min(Math.round((summaryStats.grandTotal / currentLevelInfo.next) * 100), 100);
  }, [summaryStats.grandTotal, currentLevelInfo]);

  const continuousSparklineData = useMemo(() => {
    return Array.from({ length: TOTAL_WEEKS }, () => {
      return MOCK_POINTS_DATA
        .filter((e) => e.pts > 0)
        .slice(0, 5).reduce((sum, e) => sum + e.pts, 0);
    });
  }, [filteredEvents]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Navigasi Atas */}
        <div className="mb-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1.5"
          >
            ← Kembali ke Profil
          </button>

          <button
            type="button"
            onClick={() => setShowBonusForm(!showBonusForm)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            🎁 Klaim Kode Voucher
          </button>
        </div>

        {/* FORM VOUCHER */}
        {showBonusForm && (
          <div className="mb-6 p-5 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-800 rounded-2xl shadow-xs transition-all animate-fadeIn">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Masukkan Voucher Poin Kemitraan</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Tips: Masukkan kode rahasia <code className="bg-gray-100 dark:bg-gray-800 text-indigo-600 px-1.5 py-0.5 rounded font-mono">REACT2026</code> untuk mencoba.</p>
            
            <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Contoh: REACT2026"
                  value={bonusCodeInput}
                  onChange={(e) => setBonusCodeInput(e.target.value)}
                  className={`w-full px-4 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    formError ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 dark:border-gray-800 focus:ring-indigo-500/20"
                  }`}
                />
                {formError && (
                  <span className="text-[11px] text-red-500 font-medium block mt-1.5 px-1">
                    ⚠️ {formError}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all shrink-0 h-[40px]"
              >
                {mutation.isPending ? "Memproses..." : "Tukarkan Kode"}
              </button>
            </form>
            {successClaimMsg && (
              <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg font-semibold">
                🎉 {successClaimMsg}
              </div>
            )}
          </div>
        )}

        {/* HEADER UTAMA & TOTAL SCORE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              Riwayat Reputasi Poin 
              {(isFetching || isLoading) ? (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full animate-pulse">
                  Syncing...
                </span>
              ) : (
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live
                </span>
              )}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Pantau akumulasi poin kontribusi dan validasi jawaban Anda di platform.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 p-0.5 rounded-2xl shadow-md min-w-[170px]">
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-[14px] text-center sm:text-right">
              <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Reputasi</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {summaryStats.grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* ── CARD BARU: LEVEL PROGRESS BAR CARD ── */}
        <div className={`mb-6 bg-gradient-to-r ${currentLevelInfo.color} p-[1px] rounded-2xl shadow-xs`}>
          <div className="bg-white dark:bg-gray-900 rounded-[15px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl select-none">{currentLevelInfo.icon}</span>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 block">Pangkat Kontributor</span>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{currentLevelInfo.name}</h4>
              </div>
            </div>
            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
                <span className="text-gray-500 dark:text-gray-400">Progress ke Level Berikutnya</span>
                <span className="text-indigo-600 dark:text-indigo-400">{summaryStats.grandTotal} / {currentLevelInfo.next} Pts ({progressPercentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${currentLevelInfo.color} rounded-full transition-all duration-500`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GRID RINGKASAN PERFORMA KONTRIBUSI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Kontribusi Jawaban", value: summaryStats.answersTotal, border: "border-l-emerald-500", color: "text-emerald-600 dark:text-emerald-400", bg: "hover:bg-emerald-50/20" },
            { label: "Kontribusi Pertanyaan", value: summaryStats.questionsTotal, border: "border-l-blue-500", color: "text-blue-600 dark:text-blue-400", bg: "hover:bg-blue-50/20" },
            { label: "Bonus & Reward", value: summaryStats.rewardsTotal, border: "border-l-amber-500", color: "text-amber-600 dark:text-amber-400", bg: "hover:bg-amber-50/20" },
            { label: "Pengurangan", value: summaryStats.deductionsTotal, border: "border-l-red-500", color: "text-red-500", bg: "hover:bg-red-50/20" },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 border-l-4 ${stat.border} rounded-r-xl rounded-l-md p-4 shadow-xs transition-all hover:translate-y-[-2px] ${stat.bg}`}>
              <span className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 truncate mb-1">{stat.label}</span>
              <span className={`text-xl font-bold tracking-tight ${stat.color}`}>
                {stat.value >= 0 ? `+${stat.value}` : stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* SPARKLINE CHART */}
        <div className="mb-6">
          <SparklineChart points={continuousSparklineData} />
        </div>

        {/* CARD FILTER & SEARCH CONTROLS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl w-full lg:w-auto">
              {TAB_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => changeTab(opt.value)}
                  className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === opt.value
                      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-100 dark:border-gray-700/50"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Rentang:</span>
              <div className="flex gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-lg">
                {PERIOD_OPTIONS.map((per) => (
                  <button
                    key={per.value}
                    type="button"
                    onClick={() => changePeriod(per.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activePeriod === per.value
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {per.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none text-xs">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder='Cari riwayat poin berdasarkan nama topik... (Tekan "/" untuk mencari)'
              value={searchQuery}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
          </div>
        </div>

        {/* LIST FEED */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-indigo-600 border-t-transparent rounded-full mb-3" />
              <p className="text-xs text-gray-400 font-medium">Memuat riwayat reputasi dari server...</p>
            </div>
          ) : paginatedGroups.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs">
              <span className="text-4xl block mb-2">🗓</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tidak ada data reputasi</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                Silakan ubah pengaturan filter atau hapus kata kunci pencarian Anda.
              </p>
            </div>
          ) : (
            paginatedGroups.map((group) => (
              <div key={group.date} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xs transition-all hover:shadow-xs">
                
                {/* Header Group per Hari */}
                <div className="bg-gray-50/70 dark:bg-gray-900/50 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {formatLongDate(group.date)}
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    group.net >= 0 
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {group.net >= 0 ? `+${group.net}` : group.net} Net Poin
                  </span>
                </div>

                {/* Sub-Items List dengan Efek Elevasi Ringan */}
                <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {group.items.map((event) => {
                    const currentTheme = ICON_THEMES[event.icon] ?? { color: "#9ca3af", symbol: "•", bg: "bg-gray-50" };
                    return (
                      <div key={event.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 transition-colors">
                        <div className={`w-12 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 select-none shadow-2xs ${
                          event.pts >= 0 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" 
                            : "bg-red-50 text-red-500 dark:bg-red-950/20"
                        }`}>
                          {event.pts >= 0 ? `+${event.pts}` : event.pts}
                        </div>

                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none mt-1.5 ${currentTheme.bg}`}
                          style={{ color: currentTheme.color }}
                        >
                          {currentTheme.symbol}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors break-words">
                              {event.label}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium ml-2 inline-block whitespace-nowrap bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700/50">
                              {event.meta}
                            </span>
                          </div>

                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {event.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                                >{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {event.votes !== null && (
                          <div className="text-center shrink-0 hidden sm:block bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-lg">
                            <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest">Skor</span>
                            <span className="text-xs font-extrabold text-gray-600 dark:text-gray-300">{event.votes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>

        {/* PAGINASI */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-800 pt-4 px-1">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Menampilkan lembar <strong className="text-gray-700 dark:text-gray-200">{safePage}</strong> dari {totalPages} halaman
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-2xs"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all border ${
                    pNum === safePage
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-2xs"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}