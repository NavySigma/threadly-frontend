export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: string;
  reason: string;
  description: string;
  status: string;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface CreateReportPayload {
  target_type: "post" | "comment";
  target_id: string;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  message: string;
}

export interface ReportTargetUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface ReportTargetPost {
  id: string;
  title: string;
  body: string;
  user: ReportTargetUser;
}

export interface ReportTargetComment {
  id: string;
  post_id: string;
  body: string;
  user: ReportTargetUser;
}

export interface ReportDetailResponse {
  data: Report;
  target: ReportTargetPost | ReportTargetComment | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ReportListResponse {
  current_page: number;
  data: Report[];
  first_page_url: string;
  from: number;
  last_page_url: string;
  last_page: number;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface GetReportsParams {
  page?: number;
  per_page?: number;
  status?: string;
  target_type?: string;
}