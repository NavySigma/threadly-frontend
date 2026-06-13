import { apiFetch } from "./client";
import type { LikePayload, LikeResponse } from "../types/like";

export const postLikeApi = {
  like: (postId: string) =>
    apiFetch<LikeResponse>("/likes", {
      method: "POST",
      body: JSON.stringify({
        target_type: "post",
        target_id: postId,
      } satisfies LikePayload),
    }),

  unlike: (postId: string) =>
    apiFetch<LikeResponse>("/likes", {
      method: "DELETE",
      body: JSON.stringify({
        target_type: "post",
        target_id: postId,
      } satisfies LikePayload),
    }),
};
