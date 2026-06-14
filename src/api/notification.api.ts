import { apiFetch } from "./client";
import type { NotificationResponse } from "../types/notification";

export const notificationApi = {
  /**
   * Mengambil daftar notifikasi
   */
  getNotifications: async (params?: {
    category?: string;
    is_done?: boolean;
  }) => {
    let path = "/notifications";
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append("category", params.category);
    if (params?.is_done !== undefined) queryParams.append("is_done", params.is_done.toString());
    
    const queryString = queryParams.toString();
    if (queryString) path += `?${queryString}`;

    return await apiFetch<NotificationResponse>(path);
  },

  /**
   * Menandai satu notifikasi sebagai sudah dibaca
   */
  markAsRead: async (id: string) => {
    return await apiFetch(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  markAsUndone: async (id: string) => {
    return await apiFetch(`/notifications/${id}/undone`, {
      method: "PATCH",
    });
  },

  /**
   * Menandai semua notifikasi sebagai sudah dibaca
   */
  markAllAsRead: async () => {
    return await apiFetch("/notifications/read-all", {
      method: "PATCH",
    });
  },

  /**
   * Menghapus notifikasi yang sudah dibaca
   */
  deleteRead: async () => {
    return await apiFetch("/notifications/read", {
      method: "DELETE",
    });
  },

  /**
   * Menghapus satu notifikasi
   */
  deleteNotification: async (id: string) => {
    return await apiFetch(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};
