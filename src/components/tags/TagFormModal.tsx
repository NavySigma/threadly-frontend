import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Tag } from "../../types/posts";

export interface TagPayload {
  name: string;
  color?: string | null;
}

interface TagFormModalProps {
  open: boolean;
  initialData?: Tag | null;
  onClose: () => void;
  onSubmit: (payload: TagPayload) => Promise<void>;
}

const DEFAULT_COLOR = "#14b8a6";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return fallback;
}

export default function TagFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: TagFormModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setColor(initialData?.color || DEFAULT_COLOR);
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const isEdit = Boolean(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama tag tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), color });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Tag" : "Tambah Tag"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Tag
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Contoh: Laravel"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Warna
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="#14b8a6"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}