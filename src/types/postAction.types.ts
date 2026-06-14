export type PostStatus = "open" | "closed";

export interface PostActionResponse {
  message: string;
  post?: {
    id: number;
    status: PostStatus;
    closed_at: string | null;
  };
}

export interface UsePostActionProps {
  postId: string;
  postStatus: PostStatus;
  closedAt: string | null;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export interface UsePostActionReturn {
  isOpen: boolean;
  isLoadingClose: boolean;
  isLoadingReopen: boolean;
  isLoadingDelete: boolean;
  canReopen: boolean;
  handleToggleMenu: () => void;
  handleClose: () => void;
  handleReopen: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  closeMenu: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export interface PostActionViewProps {
  postStatus: PostStatus;
  isOpen: boolean;
  isLoadingClose: boolean;
  isLoadingReopen: boolean;
  isLoadingDelete: boolean;
  canReopen: boolean;
  showDelete: boolean;
  isOwner: boolean;
  onToggleMenu: () => void;
  onClose: () => void;
  onReopen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}