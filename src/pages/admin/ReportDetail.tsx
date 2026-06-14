import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { reportAdminApi } from "../../api/reportAdmin.api";
import type { Report, ReportTargetPost, ReportTargetComment } from "../../types";
import { ArrowLeft, CheckCircle, Trash2, AlertCircle, FileText, MessageSquare, Clock, Shield } from "lucide-react";
import { StatusBadge, formatDate } from "./ReportPage";
import { useAuth } from "../../hooks/useAuth";

export default function ReportDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isModOrAdmin = user?.roles?.some((r) => ["admin", "moderator"].includes(r.name));

  const [report, setReport] = useState<Report | null>(null);
  const [target, setTarget] = useState<ReportTargetPost | ReportTargetComment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;
  if (!isModOrAdmin) return <Navigate to="/" replace />;

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
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <button
        onClick={() => navigate("/admin/reports")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#0d9488]"
      >
        <ArrowLeft size={16} /> Kembali ke daftar laporan
      </button>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Detail Laporan</h1>
              <p className="text-xs text-zinc-400">ID: {report.id}</p>
            </div>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-zinc-900">Informasi Pelaporan</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Pelapor</span>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    {report.reporter?.avatar_url ? (
                      <img src={report.reporter.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-xs font-bold text-white">
                        {(report.reporter?.username ?? report.reporter_id).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-800">
                      {report.reporter?.username ?? "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tipe Target</span>
                  <div className="mt-1.5">
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
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Alasan</span>
                  <p className="mt-1 text-sm font-semibold text-red-600">{report.reason}</p>
                </div>
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tanggal</span>
                  <p className="mt-1 text-sm text-zinc-800">{formatDate(report.created_at)}</p>
                </div>
              </div>
              {report.description && (
                <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Deskripsi</span>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">{report.description}</p>
                </div>
              )}
            </div>

            {target && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-zinc-900">Konten yang Dilaporkan</h2>
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  {"title" in target && (
                    <h3 className="mb-2 text-sm font-bold text-zinc-900">{target.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                    {target.body?.includes("[komentar telah dihapus") && report.description
                      ? report.description
                      : target.body}
                  </p>
                  <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">
                      {target.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{target.user.username}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Metadata</h3>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-[11px] font-medium text-zinc-400">Dibuat</span>
                  <p className="text-sm text-zinc-800">{formatDate(report.created_at)}</p>
                </div>
                {report.resolved_at && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">Selesai</span>
                    <p className="text-sm text-zinc-800">{formatDate(report.resolved_at)}</p>
                  </div>
                )}
                {report.resolver && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">Di proses oleh</span>
                    <p className="text-sm font-medium text-zinc-800">{report.resolver.username}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tindakan Admin</h3>
              </div>
              <button
                onClick={handleResolve}
                disabled={isActionLoading || report.status !== "pending"}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} />
                {report.status === "resolved" ? "Sudah Selesai" : "Setujui & Hapus Konten"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isActionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                Hapus Laporan
              </button>
              {report.status !== "pending" && (
                <p className="text-center text-xs text-zinc-400">Laporan ini sudah diproses</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
