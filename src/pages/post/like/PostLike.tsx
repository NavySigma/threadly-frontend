import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postLikeApi } from "../../../api/postLike.api";

interface PostLikeProps {
  postId: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function PostLike({
  postId,
  initialLiked = false,
  initialCount = 0,
}: PostLikeProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  // Ref agar callback mutation selalu membaca nilai liked terbaru
  const likedRef = useRef(initialLiked);

  const mutation = useMutation({
    mutationFn: () =>
      likedRef.current
        ? postLikeApi.unlike(postId)
        : postLikeApi.like(postId),

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
      console.error("PostLike error:", message);
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      style={{
        border: `1px solid ${liked ? "#e67c00" : "#d1d5db"}`,
        borderRadius: "6px",
        padding: "6px 12px",
        cursor: mutation.isPending ? "not-allowed" : "pointer",
        background: "none",
        color: liked ? "#e67c00" : undefined,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
      }}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>{likeCount > 0 ? likeCount : "Like"}</span>
    </button>
  );
}
