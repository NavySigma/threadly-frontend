import type { GetReportsParams, ReportDetailResponse, ReportListResponse } from "../types/report.type";
import axiosInstance from "../lib/axios";

const BASE_URL = "/reports";

export const reportAdminApi = {
  // GET /api/reports
  getReports: async (
    params?: GetReportsParams
  ): Promise<ReportListResponse> => {
    const response = await axiosInstance.get<ReportListResponse>(BASE_URL, {
      params,
    });
    return response.data;
  },

  // GET /api/reports/:id
  getReportById: async (id: string): Promise<ReportDetailResponse> => {
    const response = await axiosInstance.get<ReportDetailResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  // PATCH/PUT /api/reports/:id (resolve report)
  resolveReport: async (
    id: string,
    payload: { status: string }
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.patch<{ message: string }>(
      `${BASE_URL}/${id}`,
      payload
    );
    return response.data;
  },

  // DELETE /api/reports/:id
  deleteReport: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },
};