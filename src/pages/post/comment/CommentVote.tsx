import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { commentVoteApi } from "../../../api/commentVote.api";

type VoteType = "upvote" | "downvote";

interface CommentVoteProps {
  commentId: string;
  voteScore: number;
  initialUserVote?: VoteType | null;
}

export default function CommentVote({
  commentId,
  voteScore,
  initialUserVote = null,
}: CommentVoteProps) {
  const [score, setScore] = useState(voteScore ?? 0);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote ?? null);

  // Ref agar onSuccess selalu baca userVote terbaru, bukan stale closure
  const userVoteRef = useRef<VoteType | null>(initialUserVote ?? null);

  const mutation = useMutation({
    mutationFn: (voteType: VoteType) =>
      voteType === "upvote"
        ? commentVoteApi.upvote(commentId)
        : commentVoteApi.downvote(commentId),

    onSuccess: (_data, voteType) => {
      const previousVote = userVoteRef.current;

      setScore((prev) => {
        if (previousVote === voteType) {
          // Toggle off
          return voteType === "upvote" ? prev - 1 : prev + 1;
        }
        if (previousVote !== null) {
          // Ganti vote
          return voteType === "upvote" ? prev + 2 : prev - 2;
        }
        // Vote baru
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
      console.error("CommentVote error:", message);
    },
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* UPVOTE — aktif: hijau */}
      <button
        type="button"
        onClick={() => mutation.mutate("upvote")}
        disabled={mutation.isPending}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: `1px solid ${userVote === "upvote" ? "#16a34a" : "#e5e7eb"}`,
          background: userVote === "upvote" ? "#dcfce7" : "#ffffff",
          color: userVote === "upvote" ? "#16a34a" : "#6b7280",
          fontSize: 12,
          fontWeight: 700,
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ▲
      </button>

      <span
        style={{
          minWidth: 20,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#374151",
        }}
      >
        {score}
      </span>

      {/* DOWNVOTE — aktif: oranye */}
      <button
        type="button"
        onClick={() => mutation.mutate("downvote")}
        disabled={mutation.isPending}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: `1px solid ${userVote === "downvote" ? "#f97316" : "#e5e7eb"}`,
          background: userVote === "downvote" ? "#ffedd5" : "#ffffff",
          color: userVote === "downvote" ? "#f97316" : "#6b7280",
          fontSize: 12,
          fontWeight: 700,
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ▼
      </button>

      {mutation.isError && (
        <small style={{ color: "#dc2626", fontSize: 11 }}>
          {(() => {
            const err = mutation.error;
            return err &&
              typeof err === "object" &&
              "message" in err &&
              typeof (err as { message: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Gagal";
          })()}
        </small>
      )}
    </div>
  );
}
