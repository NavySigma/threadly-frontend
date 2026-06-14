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
}

export interface UsePostActionReturn {
  isOpen: boolean;
  isLoadingClose: boolean;
  isLoadingReopen: boolean;
  canReopen: boolean;
  handleToggleMenu: () => void;
  handleClose: () => void;
  handleReopen: () => void;
  handleEdit: () => void;
  closeMenu: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

export interface PostActionViewProps {
  postStatus: PostStatus;
  isOpen: boolean;
  isLoadingClose: boolean;
  isLoadingReopen: boolean;
  canReopen: boolean;
  onToggleMenu: () => void;
  onClose: () => void;
  onReopen: () => void;
  onEdit: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}