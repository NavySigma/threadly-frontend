import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { commentLikeApi } from "../../../api/commentLike.api";

interface CommentLikeProps {
  commentId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function CommentLike({
  commentId,
  initialLiked = false,
  initialCount = 0,
}: CommentLikeProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  // Ref agar mutationFn selalu baca liked terbaru, bukan stale closure
  const likedRef = useRef(initialLiked);

  const mutation = useMutation({
    mutationFn: () =>
      likedRef.current
        ? commentLikeApi.unlike(commentId)
        : commentLikeApi.like(commentId),

    onSuccess: () => {
      const wasLiked = likedRef.current;
      likedRef.current = !wasLiked;
      setLiked(!wasLiked);
      setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    },

    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Gagal";
      console.error("CommentLike error:", message);
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        border: `1px solid ${liked ? "#e67c00" : "#d1d5db"}`,
        borderRadius: "4px",
        background: liked ? "#fff7ed" : "none",
        cursor: mutation.isPending ? "not-allowed" : "pointer",
        fontSize: 12,
        color: liked ? "#e67c00" : "#6b7280",
        transition: "all 0.15s ease",
      }}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      {likeCount > 0 && (
        <span style={{ fontWeight: 600 }}>{likeCount}</span>
      )}
    </button>
  );
}
