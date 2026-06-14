import type { CreateReportPayload, ReportResponse } from "../types/report.type";
import { apiFetch } from "./client";


export const reportApi = {
  create: async (payload: CreateReportPayload) => {
    return apiFetch<ReportResponse>("/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getById: async (reportId: string) => {
    return apiFetch<Report>(`/reports/${reportId}`);
  },

  getAll: async () => {
    return apiFetch<Report[]>("/reports");
  },
};