export interface LikePayload {
  target_type: "post" | "comment";
  target_id: string;
}

export interface LikeResponse {
  message?: string;
  success?: boolean;
}
