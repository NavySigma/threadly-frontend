import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../api/posts";

interface PostActionMenuProps {
  postId: string;
  postStatus: "open" | "closed" | "deleted";
  closedAt?: string | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

function isReopenable(closedAt?: string | null) {
  if (!closedAt) return false;
  const closedMs = new Date(closedAt).getTime();
  if (Number.isNaN(closedMs)) return false;
  const elapsedMs = Date.now() - closedMs;
  return elapsedMs < 24 * 60 * 60 * 1000;
}

export function PostActionMenu({
  postId,
  postStatus,
  closedAt,
  onDeleted,
  onUpdated,
}: PostActionMenuProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await postsApi.delete(postId);
      onDeleted?.();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus postingan.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Jadikan postingan ini private? Anda bisa membukanya kembali dalam 24 jam.",
      )
    ) {
      return;
    }

    setIsClosing(true);
    try {
      await postsApi.close(postId);
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert("Gagal menjadikan postingan private.");
    } finally {
      setIsClosing(false);
      setIsOpen(false);
    }
  };

  const handleReopen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReopening(true);
    try {
      await postsApi.reopen(postId);
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert("Gagal membuka kembali postingan. Mungkin sudah lewat 24 jam.");
    } finally {
      setIsReopening(false);
      setIsOpen(false);
    }
  };

  const canReopen = postStatus === "closed" && isReopenable(closedAt);
  const cannotReopen = postStatus === "closed" && !canReopen;

  return (
    <div
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          type="button"
          className="inline-flex justify-center items-center rounded-full h-10 w-10 bg-white/95 text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-100 focus:outline-none"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="sr-only">Open post actions</span>
          <span className="text-base font-black leading-none">⋮</span>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-left absolute left-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {postStatus === "open" && (
              <>
                <button
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                  className="text-gray-700 block px-4 py-2 text-xs text-left w-full hover:bg-gray-100"
                  role="menuitem"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="text-gray-700 block px-4 py-2 text-xs text-left w-full hover:bg-gray-100"
                  role="menuitem"
                >
                  {isClosing ? "..." : "🔒 Private"}
                </button>
              </>
            )}

            {postStatus === "closed" && (
              <>
                {canReopen ? (
                  <button
                    onClick={handleReopen}
                    disabled={isReopening}
                    className="text-gray-700 block px-4 py-2 text-xs text-left w-full hover:bg-gray-100"
                    role="menuitem"
                  >
                    {isReopening ? "..." : "🔓 Buka kembali"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="text-gray-400 block px-4 py-2 text-xs text-left w-full cursor-not-allowed"
                    role="menuitem"
                  >
                    🔒 Sudah lewat 24 jam
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 block px-4 py-2 text-xs text-left w-full hover:bg-red-50"
              role="menuitem"
            >
              {isDeleting ? "..." : "🗑️ Hapus"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
