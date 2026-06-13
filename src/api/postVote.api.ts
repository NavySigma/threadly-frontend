import { apiFetch } from "./client";
import type {
  VotePayload,
  VoteResponse,
} from "../types/vote";

export const postVoteApi = {
  upvote: (postId: string) =>
    apiFetch<VoteResponse>("/votes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "post",
        target_id: postId,
        vote_type: "upvote",
      } satisfies VotePayload),
    }),

  downvote: (postId: string) =>
    apiFetch<VoteResponse>("/votes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "post",
        target_id: postId,
        vote_type: "downvote",
      } satisfies VotePayload),
    }),
};