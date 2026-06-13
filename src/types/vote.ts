export type VoteType = "upvote" | "downvote";

export interface VotePayload {
  target_type: "post" | "comment";
  target_id: string;
  vote_type: VoteType;
}

export interface VoteResponse {
  message?: string;
  success?: boolean;
}
