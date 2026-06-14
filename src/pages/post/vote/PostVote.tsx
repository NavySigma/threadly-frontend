import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postVoteApi } from "../../../api/postVote.api";

interface PostVoteProps {
  postId: string;
  score: number;
  userVote?: "upvote" | "downvote" | null;
}

type VoteType = "upvote" | "downvote";

export default function PostVote({
  postId,
  score,
  userVote: initialUserVote = null,
}: PostVoteProps) {
  const [currentScore, setCurrentScore] = useState(score ?? 0);
  const [userVote, setUserVote] = useState<VoteType | null>(
    initialUserVote ?? null,
  );

  // Ref agar onSuccess selalu baca userVote terbaru, bukan stale closure
  const userVoteRef = useRef<VoteType | null>(initialUserVote ?? null);

  const voteMutation = useMutation({
    mutationFn: (voteType: VoteType) =>
      voteType === "upvote"
        ? postVoteApi.upvote(postId)
        : postVoteApi.downvote(postId),

    onSuccess: (_response, voteType) => {
      const previousVote = userVoteRef.current;

      // Logika delta score sesuai backend:
      //   vote sama  → toggle off  → delta ∓1
      //   vote beda  → ganti vote  → delta ±2
      //   belum vote → vote baru   → delta ±1
      setCurrentScore((prev) => {
        if (previousVote === voteType) {
          return voteType === "upvote" ? prev - 1 : prev + 1;
        }
        if (previousVote !== null) {
          return voteType === "upvote" ? prev + 2 : prev - 2;
        }
        return voteType === "upvote" ? prev + 1 : prev - 1;
      });

      const nextVote = previousVote === voteType ? null : voteType;
      userVoteRef.current = nextVote;
      setUserVote(nextVote);
    },

    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Vote gagal";
      console.error("PostVote error:", message);
    },
  });

  // Ambil pesan error backend untuk UI
  const errorMessage = (() => {
    if (!voteMutation.isError) return null;
    const err = voteMutation.error;
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message: unknown }).message === "string"
    ) {
      return (err as { message: string }).message;
    }
    return "Vote gagal";
  })();

  const isUpvoteActive = userVote === "upvote";
  const isDownvoteActive = userVote === "downvote";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth: 40,
      }}
    >
      {/* UPVOTE — aktif: hijau */}
      <button
        type="button"
        disabled={voteMutation.isPending}
        onClick={() => voteMutation.mutate("upvote")}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `1px solid ${isUpvoteActive ? "#16a34a" : "#d1d5db"}`,
          background: isUpvoteActive ? "#dcfce7" : "none",
          color: isUpvoteActive ? "#16a34a" : "#6b7280",
          fontSize: 16,
          cursor: voteMutation.isPending ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ▲
      </button>

      <span style={{ fontWeight: 700, fontSize: 20, minWidth: 24, textAlign: "center" }}>
        {currentScore}
      </span>

      {/* DOWNVOTE — aktif: oranye */}
      <button
        type="button"
        disabled={voteMutation.isPending}
        onClick={() => voteMutation.mutate("downvote")}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `1px solid ${isDownvoteActive ? "#f97316" : "#d1d5db"}`,
          background: isDownvoteActive ? "#ffedd5" : "none",
          color: isDownvoteActive ? "#f97316" : "#6b7280",
          fontSize: 16,
          cursor: voteMutation.isPending ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ▼
      </button>

      {voteMutation.isPending && (
        <small style={{ color: "#6a737c" }}>...</small>
      )}

      {voteMutation.isError && (
        <small
          style={{
            color: "red",
            textAlign: "center",
            maxWidth: 80,
            lineHeight: 1.3,
            fontSize: 11,
          }}
        >
          {errorMessage}
        </small>
      )}
    </div>
  );
}
