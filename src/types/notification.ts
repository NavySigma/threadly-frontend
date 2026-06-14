import type { User } from "./auth";

export type NotificationType =
  | "upvote_post"
  | "like_post"
  | "reply_comment"
  | "reply_on_post"
  | "comment_post"
  | "accepted_answer"
  | "follow_user"
  | "complete_profile"
  | "report_confirmed"
  | "report_penalized"
  | "new_badge";

export type NotificationCategory = "users" | "posts" | "comments" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  is_read: boolean;
  is_done: boolean;
  actor?: User;
  target_id?: string;
  target_type?: string;
  target_title?: string;
  post_id?: string;
  message?: string | null;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationResponse {
  data: NotificationItem[];
  meta: {
    unread_count: number;
    total_count: number;
  };
}
