import React from "react";
import type { NotificationItem } from "../../../types/notification";
import NotificationItemComponent from "./NotificationItem";
import { Clock, Inbox } from "lucide-react";

interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkAsDone: (id: string) => void;
  onMarkAsUndone: (id: string) => void;
  isLoading: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsDone,
  onMarkAsUndone,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Clock size={32} />
        </div>
        <h3>Memuat notifikasi...</h3>
      </div>
    );
  }

  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Inbox size={32} />
        </div>
        <h3>Tidak ada notifikasi</h3>
        <p>Kamu sudah membaca semua notifikasi di kategori ini.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {notifications.map((notif) => (
        <NotificationItemComponent
          key={notif.id}
          notif={notif}
          onMarkAsDone={onMarkAsDone}
          onMarkAsUndone={onMarkAsUndone}
        />
      ))}
    </div>
  );
};

export default NotificationList;
