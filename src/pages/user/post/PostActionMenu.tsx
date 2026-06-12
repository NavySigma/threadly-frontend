import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../../api/posts";

interface PostActionMenuProps {
  postId: string;
  onDeleted?: () => void;
}

export function PostActionMenu({ postId, onDeleted }: PostActionMenuProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      return;
    }

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

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex justify-center w-full rounded-md px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
        >
          <span className="sr-only">Open options</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => navigate(`/posts/${postId}/edit`)}
              className="text-gray-700 block px-4 py-2 text-xs text-left w-full hover:bg-gray-100"
              role="menuitem"
            >
              ✏️ Edit
            </button>
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
