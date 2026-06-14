import { usePostAction } from "../../hooks/usePostAction";
import { PostActionView } from "./PostActionView";
import type { PostStatus } from "./../../types/postAction.types";

interface PostActionMenuProps {
  postId:     string;
  postStatus: PostStatus;
  closedAt:   string | null;
  onUpdated?: () => void;
}

export function PostActionMenu({
  postId,
  postStatus,
  closedAt,
  onUpdated,
}: PostActionMenuProps) {
  const {
    isOpen,
    isLoadingClose,
    isLoadingReopen,
    canReopen,
    handleToggleMenu,
    handleClose,
    handleReopen,
    handleEdit,
    menuRef,
  } = usePostAction({ postId, postStatus, closedAt, onUpdated });

  return (
    <PostActionView
      postStatus={postStatus}
      isOpen={isOpen}
      isLoadingClose={isLoadingClose}
      isLoadingReopen={isLoadingReopen}
      canReopen={canReopen}
      onToggleMenu={handleToggleMenu}
      onClose={handleClose}
      onReopen={handleReopen}
      onEdit={handleEdit}
      menuRef={menuRef}
    />
  );
}