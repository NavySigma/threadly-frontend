import { usePostAction } from "./../hooks/usePostAction";
import { PostActionView } from "./PostActionView";
import type { PostStatus } from "./../../types/postAction.types";

interface PostActionMenuProps {
  postId:     number;
  postStatus: PostStatus;
  closedAt:   string | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function PostActionMenu({
  postId,
  postStatus,
  closedAt,
  onDeleted,
  onUpdated,
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
  } = usePostAction({ postId, postStatus, closedAt, onDeleted, onUpdated });

  return (
    <PostActionView
      postStatus={postStatus}
      isOpen={isOpen}
      isLoadingClose={isLoadingClose}
      isLoadingReopen={isLoadingReopen}
      isLoadingDelete={isLoadingDelete}
      canReopen={canReopen}
      onToggleMenu={handleToggleMenu}
      onClose={handleClose}
      onReopen={handleReopen}
      onEdit={handleEdit}
      onDelete={handleDelete}
      menuRef={menuRef}
    />
  );
}