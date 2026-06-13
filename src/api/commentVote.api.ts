import { apiFetch } from "./client";
import type { VotePayload, VoteResponse } from "../types/vote";

export const commentVoteApi = {
  upvote: (commentId: string) =>
    apiFetch<VoteResponse>("/votes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "comment",
        target_id: commentId,
        vote_type: "upvote",
      } satisfies VotePayload),
    }),

  downvote: (commentId: string) =>
    apiFetch<VoteResponse>("/votes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "comment",
        target_id: commentId,
        vote_type: "downvote",
      } satisfies VotePayload),
    }),
};
