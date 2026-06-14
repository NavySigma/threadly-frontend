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
  target_type: "post";
  target_id: string;
  reason: string;
  description?: string;
}

export interface ReportResponse {
  message: string;
}

export interface ReportDetailResponse {
  data: Report;
  target: unknown;
}