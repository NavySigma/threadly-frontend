import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification.api";
import type { NotificationCategory } from "../types/notification";

export const useNotifications = (activeBox: "inbox" | "done", activeFilter: "all" | NotificationCategory) => {
  const queryClient = useQueryClient();

  const queryKey = ["notifications", activeBox, activeFilter];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await notificationApi.getNotifications({
        category: activeFilter === "all" ? undefined : activeFilter,
        is_done: activeBox === "done",
      });
      console.log("Notification API Response:", response);
      
      // Ensure we return a consistent structure even if API fails/returns different format
      return {
        notifications: Array.isArray(response?.data) ? response.data : [],
        unreadCount: response?.meta?.unread_count ?? 0,
      };
    },
    staleTime: 60 * 1000, // Cache valid for 1 minute
  });

  // Mutation for marking one notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate all notification queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAsDone = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
  };

  const markAsUndone = async (id: string) => {
    // Logic for mark as undone if API supports it
    console.log("Mark as undone not implemented in backend yet", id);
  };

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    markAsDone,
    markAsUndone,
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    refresh: refetch,
  };
};
