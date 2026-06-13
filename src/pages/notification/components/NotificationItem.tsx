import React from "react";
import { Link } from "react-router-dom";
import type { NotificationItem, NotificationType } from "../../../types/notification";
import { timeAgo } from "../../../utils/dateUtils"; 

interface NotificationItemProps {
  notif: NotificationItem;
  onMarkAsDone: (id: string) => void;
  onMarkAsUndone: (id: string) => void;
}

function getIconAndColor(type: NotificationType) {
  switch (type) {
    case "upvote_post":
      return { icon: "🔼", bg: "#dbeafe", color: "#2563eb" };
    case "like_post":
      return { icon: "❤️", bg: "#fce7f3", color: "#db2777" };
    case "reply_comment":
      return { icon: "↩️", bg: "#e0e7ff", color: "#4f46e5" };
    case "comment_post":
      return { icon: "💬", bg: "#f3f4f6", color: "#4b5563" };
    case "accepted_answer":
      return { icon: "✅", bg: "#dcfce7", color: "#16a34a" };
    case "follow_user":
      return { icon: "👤", bg: "#fef3c7", color: "#d97706" };
    case "complete_profile":
      return { icon: "🛠️", bg: "#f3e8ff", color: "#9333ea" };
    case "new_badge":
      return { icon: "🏆", bg: "#ffedd5", color: "#ea580c" };
    default:
      return { icon: "🔔", bg: "#f3f4f6", color: "#6b7280" };
  }
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notif,
  onMarkAsDone,
  onMarkAsUndone,
}) => {
  const { icon, bg, color } = getIconAndColor(notif.type);

  const renderContent = () => {
    switch (notif.type) {
      case "upvote_post":
        return (
          <>
            <strong>{notif.actor?.username}</strong> memberi upvote pada postinganmu{" "}
            <Link to={`/posts/${notif.target_id}`}>"{notif.target_title}"</Link>
          </>
        );
      case "like_post":
        return (
          <>
            <strong>{notif.actor?.username}</strong> menyukai postinganmu{" "}
            <Link to={`/posts/${notif.target_id}`}>"{notif.target_title}"</Link>
          </>
        );
      case "reply_comment":
        return (
          <>
            <strong>{notif.actor?.username}</strong> membalas komentarmu:{" "}
            <em>"{notif.message}"</em>
          </>
        );
      case "comment_post":
        return (
          <>
            <strong>{notif.actor?.username}</strong> mengomentari postinganmu{" "}
            <Link to={`/posts/${notif.target_id}`}>"{notif.target_title}"</Link>:{" "}
            <em>"{notif.message}"</em>
          </>
        );
      case "accepted_answer":
        return (
          <>
            Jawabanmu ditandai sebagai jawaban benar oleh <strong>{notif.actor?.username}</strong> di{" "}
            <Link to={`/posts/${notif.target_id}`}>"{notif.target_title}"</Link>!
          </>
        );
      case "follow_user":
        return (
          <>
            <strong>{notif.actor?.username}</strong> mulai mengikuti kamu.
          </>
        );
      case "complete_profile":
        return (
          <>
            Sistem: <strong>{notif.message}</strong>{" "}
            <Link to="/profile/edit">Lengkapi sekarang</Link>
          </>
        );
      case "new_badge":
        return (
          <>
            Pencapaian: <strong>{notif.message}</strong> Cek profilmu sekarang!
          </>
        );
      default:
        return <span>{notif.message}</span>;
    }
  };

  return (
    <div className={`notif-item ${!notif.is_read ? "unread" : ""}`}>
      <div className="notif-icon" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>

      <div className="notif-content">
        <div className="notif-text">{renderContent()}</div>
        <div className="notif-meta">
          <span>{timeAgo(notif.created_at)}</span>
          {!notif.is_read && <span style={{ color: "#22c55e", fontWeight: 600 }}>• Baru</span>}
        </div>
      </div>

      <div className="notif-actions">
        {!notif.is_done ? (
          <button
            className="btn-action"
            onClick={() => onMarkAsDone(notif.id)}
            title="Tandai Selesai"
          >
            ✓ Selesai
          </button>
        ) : (
          <button
            className="btn-action"
            onClick={() => onMarkAsUndone(notif.id)}
            title="Kembalikan ke Inbox"
          >
            ↩️ Inbox
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItemComponent;
