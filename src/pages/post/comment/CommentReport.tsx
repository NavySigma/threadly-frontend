import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { reportApi } from "../../../api/report.api";
import { X, AlertTriangle } from "lucide-react";
import type { ApiError, ReportResponse } from "../../../types";

interface CommentReportProps {
  commentId: string;
}

export default function CommentReport({ commentId }: CommentReportProps) {
  const storageKey = `reported_comment_${commentId}`;
  const [reported, setReported] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const reportMutation = useMutation<ReportResponse, ApiError>({
    mutationFn: () =>
      reportApi.create({
        target_type: "comment",
        target_id: commentId,
        reason: reason.trim(),
      }),

    onSuccess: () => {
      setReported(true);
      localStorage.setItem(storageKey, "true");
      setIsModalOpen(false);
      setReason("");
      alert("Laporan berhasil dikirim.");
    },

    onError: (error: ApiError) => {
      console.error("Report error:", error);
      alert(error.message || "Terjadi kesalahan saat melaporkan.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    reportMutation.mutate();
  };

  const isInvalid = !reason.trim() || reportMutation.isPending;

  return (
    <>
      <button
        type="button"
        onClick={() => !reported && setIsModalOpen(true)}
        disabled={reported || reportMutation.isPending}
        data-cy="comment-report-btn"
        style={{
          background: "none",
          border: "none",
          cursor: reported || reportMutation.isPending ? "not-allowed" : "pointer",
          fontSize: 12,
          color: reported ? "#dc2626" : "#6b7280",
          padding: 0,
          textDecoration: reported ? "none" : "underline",
          textDecorationColor: "#6b7280",
          textUnderlineOffset: 2,
        }}
      >
        {reported ? "🚩 Reported" : "Report"}
      </button>

      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="#dc2626" />
                <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
                  Laporkan Komentar
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  padding: 4,
                  borderRadius: "50%",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Alasan Laporan <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  autoFocus
                  data-cy="report-reason-input"
                  type="text"
                  placeholder="Ketik alasan (misal: Spam, Sara, dll.)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {!reason.trim() && (
                  <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "6px" }}>
                    Alasan harus diisi.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isInvalid}
                  data-cy="report-submit-btn"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: isInvalid ? "#fca5a5" : "#dc2626",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isInvalid ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {reportMutation.isPending ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
