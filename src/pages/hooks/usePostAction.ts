import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../../api/posts";
import type { UsePostActionProps, UsePostActionReturn } from "../../types/postAction.types";

export function usePostAction({
  postId,
  postStatus,
  closedAt,
  onDeleted,
  onUpdated,
}: UsePostActionProps): UsePostActionReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingClose, setIsLoadingClose] = useState(false);
  const [isLoadingReopen, setIsLoadingReopen] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleEdit = () => {
    closeMenu();
    navigate(`/posts/${postId}/edit`);
  };

  const handleClose = async () => {
    setIsLoadingClose(true);
    try {
      await postsApi.close(postId.toString());
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Failed to make post private:", err);
    } finally {
      setIsLoadingClose(false);
      closeMenu();
    }
  };

  const handleReopen = async () => {
    setIsLoadingReopen(true);
    try {
      await postsApi.reopen(postId.toString());
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Failed to make post public:", err);
    } finally {
      setIsLoadingReopen(false);
      closeMenu();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      return;
    }
    setIsLoadingDelete(true);
    try {
      await postsApi.delete(postId.toString());
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setIsLoadingDelete(false);
      closeMenu();
    }
  };

  // 24 hours reopen limit check
  const canReopen = (() => {
    if (postStatus !== "closed") return false;
    if (!closedAt) return true; // If closed but no time recorded, allow as fallback
    const elapsed = Date.now() - new Date(closedAt).getTime();
    return elapsed < 24 * 60 * 60 * 1000;
  })();

  return {
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
    closeMenu,
    menuRef,
  };
}
