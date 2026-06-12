import { useEffect, useState, useCallback } from "react";
import { commentsApi, type Comment } from "../api/comments";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await commentsApi.getByPost(postId);
      setComments(res.data);
    } catch {
      setError("Gagal memuat komentar");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId, fetchComments]);

  const addComment = useCallback(
    async (body: string): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        const res = await commentsApi.create(postId, { body });
        setComments((prev) => [...prev, { ...res.data, replies: [] }]);
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId],
  );

  const addReply = useCallback(
    async (parentId: string, body: string): Promise<boolean> => {
      try {
        setIsSubmitting(true);
        const res = await commentsApi.create(postId, {
          body,
          parent_id: parentId,
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies ?? []), res.data] }
              : c,
          ),
        );
        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId],
  );

  const editComment = useCallback(
    async (
      commentId: string,
      body: string,
      isReply = false,
      parentId?: string,
    ): Promise<boolean> => {
      try {
        const res = await commentsApi.update(commentId, { body });
        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    replies: c.replies.map((r) =>
                      r.id === commentId ? { ...r, body: res.data.body } : r,
                    ),
                  }
                : c,
            ),
          );
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId ? { ...c, body: res.data.body } : c,
            ),
          );
        }
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const countUserComments = useCallback(
    (userId: string) => comments.filter((c) => c.user.id === userId).length,
    [comments],
  );

  return {
    comments,
    isLoading,
    error,
    isSubmitting,
    addComment,
    addReply,
    editComment,
    countUserComments,
    refetch: fetchComments,
  };
}
