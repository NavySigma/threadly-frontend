import { usePostAction } from "../../hooks/usePostAction";
import { PostActionView } from "./PostActionView";
import type { PostStatus } from "./../../types/postAction.types";

interface PostActionMenuProps {
  postId:     string;
  postStatus: PostStatus;
  closedAt:   string | null;
  showDelete?: boolean;
  isOwner?: boolean;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function PostActionMenu({
  postId,
  postStatus,
  closedAt,
  showDelete = false,
  isOwner = true,
  onUpdated,
  onDeleted,
}: PostActionMenuProps) {
  const {
    isOpen,
    isLoadingClose,
    isLoadingReopen,
    isLoadingDelete,
    canReopen,
    handleToggleMenu,
    handleClose,
    handleReopen,
    handleEdit,
    handleDelete,
    menuRef,
  } = usePostAction({ postId, postStatus, closedAt, onUpdated, onDeleted });

  return (
    <PostActionView
      postStatus={postStatus}
      isOpen={isOpen}
      isLoadingClose={isLoadingClose}
      isLoadingReopen={isLoadingReopen}
      isLoadingDelete={isLoadingDelete}
      canReopen={canReopen}
      showDelete={showDelete}
      isOwner={isOwner}
      onToggleMenu={handleToggleMenu}
      onClose={handleClose}
      onReopen={handleReopen}
      onEdit={handleEdit}
      onDelete={handleDelete}
      menuRef={menuRef}
    />
  );
}