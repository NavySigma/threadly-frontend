import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportAdminApi } from "../../api/reportAdmin.api";
import type { Report, ReportTargetPost, ReportTargetComment } from "../../types";
import { ArrowLeft, CheckCircle, Trash2, AlertCircle, FileText, MessageSquare, Clock, Shield } from "lucide-react";
import { DetailRow, StatusBadge, formatDate } from "./ReportPage";

export default function ReportDetail({ id }: { id: string }) {
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [target, setTarget] = useState<ReportTargetPost | ReportTargetComment | null>(null);
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
        setTarget(response.target as ReportTargetPost | ReportTargetComment | null);
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#0d9488]"></div>
        <p className="text-sm text-zinc-500">Memuat laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <button
          onClick={() => navigate("/admin/reports")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-[#0d9488]"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-white">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <button
          onClick={() => navigate("/admin/reports")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-[#0d9488]"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-white">
          <p className="text-sm text-zinc-500">Laporan tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const isPost = report.target_type === "post";

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <button
        onClick={() => navigate("/admin/reports")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#0d9488]"
      >
        <ArrowLeft size={16} /> Kembali ke daftar laporan
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] shadow-sm">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Detail Laporan</h1>
          <p className="text-xs text-zinc-400">ID: {report.id.slice(0, 14)}...</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <FileText size={16} className="text-[#0d9488]" />
              <h2 className="text-sm font-semibold text-zinc-900">Informasi Laporan</h2>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailRow label="ID Laporan" value={report.id} />
                <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tipe Target</span>
                  <div className="pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        isPost
                          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {isPost ? <FileText size={14} /> : <MessageSquare size={14} />}
                      {report.target_type}
                    </span>
                  </div>
                </div>
              </div>
              <DetailRow label="Alasan" value={<span className="font-semibold text-red-600">{report.reason}</span>} />
              <div className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Deskripsi</span>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-sm leading-relaxed text-zinc-700">
                    {report.description || (
                      <span className="italic text-zinc-400">Tidak ada deskripsi tambahan.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {target && (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                {isPost ? (
                  <FileText size={16} className="text-cyan-600" />
                ) : (
                  <MessageSquare size={16} className="text-purple-600" />
                )}
                <h2 className="text-sm font-semibold text-zinc-900">Konten yang Dilaporkan</h2>
              </div>
              <div className="p-6">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 space-y-2">
                  {"title" in target && (
                    <h3 className="text-sm font-semibold text-zinc-900">{target.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">{target.body}</p>
                  <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
                    <span>{target.user.username}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <Clock size={16} className="text-[#0d9488]" />
              <h2 className="text-sm font-semibold text-zinc-900">Status & Metadata</h2>
            </div>
            <div className="space-y-5 p-6">
              <DetailRow label="Status" value={<StatusBadge status={report.status} />} />
              <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Pelapor</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-[10px] font-bold text-white">
                    {report.reporter_id.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-zinc-600">User #{report.reporter_id.slice(0, 8)}</span>
                </div>
              </div>
              <DetailRow label="Dibuat" value={formatDate(report.created_at)} />
              {report.resolved_at && (
                <DetailRow label="Selesai" value={formatDate(report.resolved_at)} />
              )}
              {report.resolved_by && (
                <DetailRow label="Admin" value={report.resolved_by} />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tindakan Admin</h3>
            </div>
            <button
              onClick={handleResolve}
              disabled={isActionLoading || report.status === "resolved"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
