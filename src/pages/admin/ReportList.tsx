import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportAdminApi } from "../../api/reportAdmin.api";
import type { Report } from "../../types";
import { AlertCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge, formatDate } from "./ReportPage";

const PER_PAGE = 10;

export default function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Laporan Masuk</h1>

      {isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
          <p className="text-sm text-zinc-500">Memuat laporan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
          <p className="text-sm text-zinc-500">Belum ada laporan.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <div className="col-span-3">Pelapor</div>
              <div className="col-span-2">Tipe</div>
              <div className="col-span-3">Alasan</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Tanggal</div>
              <div className="col-span-1 text-right">Aksi</div>
            </div>

            {reports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-12 gap-4 items-center border-b border-zinc-100 px-6 py-4 text-sm text-zinc-700 transition-colors last:border-b-0 hover:bg-zinc-50"
              >
                <div className="col-span-3 truncate font-medium">
                  {report.reporter_id}
                </div>
                <div className="col-span-2 capitalize text-zinc-500">
                  {report.target_type}
                </div>
                <div className="col-span-3 truncate text-zinc-500">
                  {report.reason}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={report.status} />
                </div>
                <div className="col-span-1 text-xs text-zinc-400">
                  {formatDate(report.created_at)}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                  >
                    <Eye size={14} /> Lihat
                  </button>
                </div>
              </div>
            ))}
          </div>

          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-zinc-100"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-zinc-500">
                {page} / {lastPage}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-zinc-100"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
