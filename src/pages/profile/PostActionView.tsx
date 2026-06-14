import type { PostActionViewProps } from "../../types/postAction.types";

function Spinner() {
  return (
    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
  );
}

interface MenuItemProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "danger";
  icon: React.ReactNode;
  label: string;
}

function MenuItem({
  onClick,
  disabled = false,
  loading = false,
  variant = "default",
  icon,
  label,
}: MenuItemProps) {
  const colors =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800";

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors}`}
    >
      <span className="w-4 flex items-center justify-center">
        {loading ? <Spinner /> : icon}
      </span>
      {label}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7a.75.75 0 0 0 0-1.5H4.75Z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v4A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
    </svg>
  );
}

function IconUnlock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5v1.879A1.5 1.5 0 0 0 3 7.878v4.75A1.5 1.5 0 0 0 4.5 14.13h7a1.5 1.5 0 0 0 1.5-1.5v-4.75a1.5 1.5 0 0 0-1.5-1.5V4.5A3.5 3.5 0 0 0 8 1Zm0 1.5A2 2 0 0 1 10 4.5v1H6V4.5A2 2 0 0 1 8 2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

// ─── PostActionView ───────────────────────────────────────────────────────────

export function PostActionView({
  postStatus,
  isOpen,
  isLoadingClose,
  isLoadingReopen,
  isLoadingDelete,
  canReopen,
  showDelete,
  onToggleMenu,
  onClose,
  onReopen,
  onEdit,
  onDelete,
  menuRef,
}: PostActionViewProps) {
  const isPrivate = postStatus === "closed";

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={onToggleMenu}
        className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        aria-label="Post actions"
      >
        <IconDots />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-9 z-30 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">

          {/* Edit — always shown */}
          <MenuItem
            onClick={onEdit}
            icon={<IconEdit />}
            label="Edit"
          />

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Private */}
          <MenuItem
            onClick={onClose}
            loading={isLoadingClose}
            disabled={isPrivate}
            icon={<IconLock />}
            label="Private"
          />

          {/* Public — only shown when private */}
          {isPrivate && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <MenuItem
                onClick={onReopen}
                loading={isLoadingReopen}
                disabled={!canReopen}
                icon={<IconUnlock />}
                label="Public"
              />
            </>
          )}

          {/* Cannot re-public info */}
          {isPrivate && !canReopen && (
            <div className="px-3.5 py-2.5 text-xs text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 leading-snug border-t border-gray-100 dark:border-gray-800">
              Tidak dapat dipublikasi ulang setelah 24 jam.
            </div>
          )}

          {/* Delete — shown only for mod/admin */}
          {showDelete && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <MenuItem
                onClick={onDelete}
                loading={isLoadingDelete}
                variant="danger"
                icon={<IconTrash />}
                label="Hapus Postingan"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}