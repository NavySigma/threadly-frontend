import { useState } from "react";
import type { NotificationCategory } from "../../types/notification";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationSidebar from "./components/NotificationSidebar";
import NotificationList from "./components/NotificationList";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [activeBox, setActiveBox] = useState<"inbox" | "done">("inbox");
  const [activeFilter, setActiveFilter] = useState<"all" | NotificationCategory>("all");
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsDone,
    markAsUndone,
    markAllAsRead,
  } = useNotifications(activeBox, activeFilter);

  return (
    <div className="notif-container">
      {/* Sidebar */}
      <NotificationSidebar
        activeBox={activeBox}
        setActiveBox={setActiveBox}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <div className="notif-main">
        <div className="notif-header">
          <h1>{activeBox === "inbox" ? "Inbox Notifikasi" : "Notifikasi Selesai"}</h1>
          {activeBox === "inbox" && notifications.length > 0 && (
            <button
              className="btn-action"
              style={{ color: "#4f46e5", borderColor: "#c7d2fe", background: "#eef2ff" }}
              onClick={markAllAsRead}
            >
              Tandai semua selesai
            </button>
          )}
        </div>

        <NotificationList
          notifications={notifications}
          onMarkAsDone={markAsDone}
          onMarkAsUndone={markAsUndone}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
