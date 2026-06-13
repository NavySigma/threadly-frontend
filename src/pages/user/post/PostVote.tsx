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
    initialUserVote ?? null
  );

  // Ref agar callback mutation selalu membaca nilai userVote terbaru,
  // bukan stale closure dari saat mutation didefinisikan.
  const userVoteRef = useRef<VoteType | null>(initialUserVote ?? null);

  const voteMutation = useMutation({
    mutationFn: (voteType: VoteType) =>
      voteType === "upvote"
        ? postVoteApi.upvote(postId)
        : postVoteApi.downvote(postId),

    onSuccess: (_response, voteType) => {
      // Baca state vote sebelumnya dari ref (selalu fresh)
      const previousVote = userVoteRef.current;

      // Hitung delta score berdasarkan logika backend:
      //   - Vote sama → toggle off (batalkan)
      //   - Vote berbeda → ganti vote (delta ±2)
      //   - Belum vote → vote baru (delta ±1)
      setCurrentScore((prev) => {
        if (previousVote === voteType) {
          // Toggle off: batalkan vote
          return voteType === "upvote" ? prev - 1 : prev + 1;
        }
        if (previousVote !== null) {
          // Ganti vote: reverse lama + apply baru
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
      // Tampilkan pesan error dari backend jika ada
      // (misal: "Minimal 15 poin untuk downvote", "Tidak bisa vote konten sendiri")
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Vote gagal";
      console.error("Vote error:", message);
    },
  });

  const handleVote = (voteType: VoteType) => {
    voteMutation.mutate(voteType);
  };

  // Ambil pesan error dari backend untuk ditampilkan di UI
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
      <button
        type="button"
        disabled={voteMutation.isPending}
        onClick={() => handleVote("upvote")}
        style={{
          background: "none",
          border: "1px solid #d1d5db",
          borderRadius: "50%",
          width: 36,
          height: 36,
          cursor: voteMutation.isPending ? "not-allowed" : "pointer",
          fontSize: 16,
          color: userVote === "upvote" ? "#e67c00" : undefined,
          borderColor: userVote === "upvote" ? "#e67c00" : "#d1d5db",
        }}
      >
        ▲
      </button>

      <span style={{ fontWeight: 700, fontSize: 20 }}>{currentScore}</span>

      <button
        type="button"
        disabled={voteMutation.isPending}
        onClick={() => handleVote("downvote")}
        style={{
          background: "none",
          border: "1px solid #d1d5db",
          borderRadius: "50%",
          width: 36,
          height: 36,
          cursor: voteMutation.isPending ? "not-allowed" : "pointer",
          fontSize: 16,
          color: userVote === "downvote" ? "#6a737c" : undefined,
          borderColor: userVote === "downvote" ? "#6a737c" : "#d1d5db",
        }}
      >
        ▼
      </button>

      {voteMutation.isPending && (
        <small style={{ color: "#6a737c" }}>...</small>
      )}

      {voteMutation.isError && (
        <small style={{ color: "red", textAlign: "center", maxWidth: 80, lineHeight: 1.3 }}>
          {errorMessage}
        </small>
      )}
    </div>
  );
}
