import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { commentVoteApi } from "../../../api/commentVote.api";

interface CommentVoteProps {
  commentId: string;
  voteScore: number;
}

type VoteType = "upvote" | "downvote";

export default function CommentVote({ commentId, voteScore }: CommentVoteProps) {
  const [score, setScore] = useState(voteScore ?? 0);
  const [userVote, setUserVote] = useState<VoteType | null>(null);

  // Ref agar onSuccess selalu baca userVote terbaru, bukan stale closure
  const userVoteRef = useRef<VoteType | null>(null);

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
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button
        type="button"
        onClick={() => mutation.mutate("upvote")}
        disabled={mutation.isPending}
        style={{
          background: "none",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          padding: "2px 7px",
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          fontSize: 12,
          color: userVote === "upvote" ? "#e67c00" : "#6a737c",
          borderColor: userVote === "upvote" ? "#e67c00" : "#e5e7eb",
        }}
      >
        ▲
      </button>

      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", minWidth: 16, textAlign: "center" }}>
        {score}
      </span>

      <button
        type="button"
        onClick={() => mutation.mutate("downvote")}
        disabled={mutation.isPending}
        style={{
          background: "none",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          padding: "2px 7px",
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          fontSize: 12,
          color: userVote === "downvote" ? "#6a737c" : "#6a737c",
          borderColor: userVote === "downvote" ? "#6a737c" : "#e5e7eb",
        }}
      >
        ▼
      </button>

      {mutation.isError && (
        <small style={{ color: "red", fontSize: 11 }}>
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
