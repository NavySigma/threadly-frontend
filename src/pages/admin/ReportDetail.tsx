import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportAdminApi } from "../../api/reportAdmin.api";
import type { Report } from "../../types";
import { ArrowLeft, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { DetailRow, StatusBadge, formatDate } from "./ReportPage";

export default function ReportDetail({ id }: { id: string }) {
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await reportAdminApi.getReportById(id);

        setReport(response.data);
        setTarget(response.target as string | null);
      } catch (err) {
        setError("Gagal memuat data laporan. Coba lagi nanti.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleResolve = async () => {
    if (!window.confirm("Tandai laporan ini sebagai selesai?")) return;

    try {
      setIsActionLoading(true);
      await reportAdminApi.resolveReport(id, { status: "resolved" });
      alert("Laporan berhasil diselesaikan.");
      const response = await reportAdminApi.getReportById(id);
      setReport(response.data);
    } catch (err) {
      alert("Gagal menyelesaikan laporan.");
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus laporan ini secara permanen?")) return;

    try {
      setIsActionLoading(true);
      await reportAdminApi.deleteReport(id);
      alert("Laporan berhasil dihapus.");
      navigate("/admin/reports");
    } catch (err) {
      alert("Gagal menghapus laporan.");
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
        <p className="text-sm text-zinc-500">Memuat laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-500">Laporan tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/reports")}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-xl font-bold text-zinc-900">Detail Laporan</h1>
        <div className="w-20"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-900">Informasi Laporan</h2>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID Laporan" value={report.id} />
              <DetailRow label="Tipe Target" value={report.target_type} />
              <DetailRow label="Alasan" value={<span className="font-semibold text-red-600">{report.reason}</span>} />
              <div className="space-y-1 pt-2">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Deskripsi</span>
                <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic">
                  {report.description || "Tidak ada deskripsi tambahan."}
                </p>
              </div>
            </div>
          </div>

          {target && (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <h2 className="text-sm font-semibold text-zinc-900">Konten yang Dilaporkan</h2>
              </div>
              <div className="p-6">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">{target}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-900">Status & Metadata</h2>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="Status" value={<StatusBadge status={report.status} />} />
              <DetailRow label="Pelapor" value={<span className="text-xs font-mono">{report.reporter_id}</span>} />
              <DetailRow label="Dibuat" value={formatDate(report.created_at)} />
              {report.resolved_at && (
                <DetailRow label="Selesai" value={formatDate(report.resolved_at)} />
              )}
              {report.resolved_by && (
                <DetailRow label="Admin" value={report.resolved_by} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2">Tindakan Admin</h3>
            <button
              onClick={handleResolve}
              disabled={isActionLoading || report.status === "resolved"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              {report.status === "resolved" ? "Sudah Selesai" : "Tandai Selesai"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isActionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Hapus Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
