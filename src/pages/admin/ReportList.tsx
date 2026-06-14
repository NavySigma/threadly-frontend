import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { reportAdminApi } from "../../api/reportAdmin.api";
import type { Report } from "../../types";
import { AlertCircle, ChevronLeft, ChevronRight, FileText, MessageSquare } from "lucide-react";
import { StatusBadge, formatDate } from "./ReportPage";
import { useAuth } from "../../hooks/useAuth";

const PER_PAGE = 10;

function TargetTypeBadge({ type }: { type: string }) {
  const isPost = type === "post";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        isPost
          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
          : "bg-purple-50 text-purple-700 border border-purple-200"
      }`}
    >
      {isPost ? <FileText size={12} /> : <MessageSquare size={12} />}
      {type}
    </span>
  );
}

export default function ReportList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isModOrAdmin = user?.roles?.some((r) => ["admin", "moderator"].includes(r.name));

  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;
  if (!isModOrAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await reportAdminApi.getReports({
          page,
          per_page: PER_PAGE,
        });
        setReports(res.data ?? []);
        setLastPage(res.last_page ?? 1);
        setTotal(res.total ?? 0);
      } catch (err) {
        setError("Gagal memuat laporan.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [page]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Laporan Masuk</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {total > 0 ? `${total} laporan ditemukan` : "Kelola laporan dari pengguna"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#0d9488]"></div>
          <p className="text-sm text-zinc-500">Memuat laporan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-white">
          <CheckCircle className="h-10 w-10 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">Belum ada laporan masuk</p>
          <p className="text-xs text-zinc-400">Semua laporan akan muncul di sini</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Pelapor</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Tipe</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Alasan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="transition-colors hover:bg-zinc-50/50 cursor-pointer"
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {report.reporter?.avatar_url ? (
                          <img
                            src={report.reporter.avatar_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-xs font-bold text-white">
                            {(report.reporter?.username ?? report.reporter_id).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-zinc-800">
                            {report.reporter?.username ?? `User #${report.reporter_id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-zinc-400">{report.reporter_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <TargetTypeBadge type={report.target_type} />
                    </td>
                    <td className="max-w-[200px] px-5 py-4">
                      <p className="truncate text-sm text-zinc-700">{report.reason}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="whitespace-nowrap text-xs text-zinc-500">{formatDate(report.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Halaman {page} dari {lastPage}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-all hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                  let pageNum: number;
                  if (lastPage <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= lastPage - 2) {
                    pageNum = lastPage - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        pageNum === page
                          ? "bg-[#0d9488] text-white shadow-sm"
                          : "border border-zinc-200 bg-white text-zinc-600 hover:border-[#0d9488] hover:text-[#0d9488]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-all hover:border-[#0d9488] hover:text-[#0d9488] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
