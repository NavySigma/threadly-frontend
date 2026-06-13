import React from "react";
import type { NotificationCategory } from "../../../types/notification";

interface NotificationSidebarProps {
  activeBox: "inbox" | "done";
  setActiveBox: (box: "inbox" | "done") => void;
  activeFilter: "all" | NotificationCategory;
  setActiveFilter: (filter: "all" | NotificationCategory) => void;
  unreadCount: number;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  activeBox,
  setActiveBox,
  activeFilter,
  setActiveFilter,
  unreadCount,
}) => {
  return (
    <div className="notif-sidebar">
      <div>
        <div className="sidebar-section-title">Kotak Masuk</div>
        <button
          className={`sidebar-nav-btn ${activeBox === "inbox" ? "active" : ""}`}
          onClick={() => setActiveBox("inbox")}
        >
          <span>📥 Inbox</span>
          {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>
        <button
          className={`sidebar-nav-btn ${activeBox === "done" ? "active" : ""}`}
          onClick={() => setActiveBox("done")}
        >
          <span>✅ Done</span>
        </button>
      </div>

      <div>
        <div className="sidebar-section-title">Filter Kategori</div>
        <button
          className={`sidebar-nav-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <span>Semua</span>
        </button>
        <button
          className={`sidebar-nav-btn ${activeFilter === "users" ? "active" : ""}`}
          onClick={() => setActiveFilter("users")}
        >
          <span>👥 Users</span>
        </button>
        <button
          className={`sidebar-nav-btn ${activeFilter === "posts" ? "active" : ""}`}
          onClick={() => setActiveFilter("posts")}
        >
          <span>📝 Posts</span>
        </button>
        <button
          className={`sidebar-nav-btn ${activeFilter === "comments" ? "active" : ""}`}
          onClick={() => setActiveFilter("comments")}
        >
          <span>💬 Comments</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSidebar;
