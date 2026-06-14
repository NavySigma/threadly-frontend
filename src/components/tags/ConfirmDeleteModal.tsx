import { useState } from "react";
import type { Tag } from "../../types/posts";

interface ConfirmDeleteModalProps {
  tag: Tag | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
}

export default function ConfirmDeleteModal({
  tag,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tag) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus tag"));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Hapus Tag</h2>
        <p className="mb-4 text-sm text-gray-600">
          Apakah kamu yakin ingin menghapus tag{" "}
          <span className="font-semibold">{tag.name}</span>? Tindakan ini
          tidak dapat dibatalkan.
        </p>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}