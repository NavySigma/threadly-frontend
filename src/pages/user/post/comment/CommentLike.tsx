import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { commentLikeApi } from "../../../../api/commentLike.api";

interface CommentLikeProps {
  commentId: string;
}

export default function CommentLike({ commentId }: CommentLikeProps) {
  const [liked, setLiked] = useState(false);

  // Ref agar mutationFn selalu baca liked terbaru, bukan stale closure
  const likedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: () =>
      likedRef.current
        ? commentLikeApi.unlike(commentId)
        : commentLikeApi.like(commentId),

    onSuccess: () => {
      likedRef.current = !likedRef.current;
      setLiked(likedRef.current);
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
        padding: "2px 8px",
        border: `1px solid ${liked ? "#e67c00" : "#d1d5db"}`,
        borderRadius: "4px",
        background: "none",
        cursor: mutation.isPending ? "not-allowed" : "pointer",
        fontSize: 12,
        color: liked ? "#e67c00" : "#6b7280",
      }}
    >
      {liked ? "❤️" : "🤍"}
    </button>
  );
}
