import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../../api/posts";

interface PostActionMenuProps {
  postId: string;
  isPrivate?: boolean;
  onDeleted?: () => void;
  onPrivate?: (postId: string) => Promise<void>;
}

export function PostActionMenu({
  postId,
  isPrivate = false,
  onDeleted,
  onPrivate,
}: PostActionMenuProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const ok = window.confirm(
      "Apakah Anda yakin ingin menghapus postingan ini?"
    );

    if (!ok) return;

    setIsDeleting(true);

    try {
      await postsApi.delete(postId);

      onDeleted?.();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus postingan.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handlePrivate = async (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const ok = window.confirm(
      "Postingan yang diprivate tidak dapat dipublic kembali. Lanjutkan?"
    );

    if (!ok) return;

    try {
      await onPrivate?.(postId);

      alert("Postingan berhasil diprivate.");

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal memprivate postingan.");
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        type="button"
        className="inline-flex justify-center rounded-md px-2 py-1 bg-white text-sm text-gray-700 hover:bg-gray-50"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg border border-gray-200 z-50">
          <button
            onClick={() =>
              navigate(`/posts/${postId}/edit`)
            }
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            ✏️ Edit
          </button>

          {!isPrivate && (
            <button
              onClick={handlePrivate}
              className="block w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
            >
              🔒 Private
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            {isDeleting
              ? "Menghapus..."
              : "🗑️ Hapus"}
          </button>
        </div>
      )}
    </div>
  );
}