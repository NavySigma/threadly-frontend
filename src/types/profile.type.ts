export type MainTab = "profile" | "activity" | "likes";

export type ActivityTab =
  | "summary"
  | "answers"
  | "questions"
  | "tags"
  | "badges"
  | "reputation";

export type Tab = "profile" | "password";

export interface ProfileFormValues {
  username: string;
  bio: string;
  avatar_url: string;
}

export interface PasswordFormValues {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
