import { apiFetch } from "./client";
import type { LikePayload, LikeResponse } from "../types/like";

export const commentLikeApi = {
  like: (commentId: string) =>
    apiFetch<LikeResponse>("/likes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "comment",
        target_id: commentId,
      } satisfies LikePayload),
    }),

  unlike: (commentId: string) =>
    apiFetch<LikeResponse>("/likes", {
      method: "DELETE",
      body: JSON.stringify({
        target_type: "comment",
        target_id: commentId,
      } satisfies LikePayload),
    }),
};
