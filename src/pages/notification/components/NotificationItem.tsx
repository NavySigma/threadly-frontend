import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { NotificationItem, NotificationType } from "../../../types/notification";
import { timeAgo } from "../../../utils/dateUtils";
import {
  ThumbsUp,
  Heart,
  Reply,
  MessageSquare,
  CheckCircle,
  UserPlus,
  Settings,
  Award,
  Bell,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";

interface NotificationItemProps {
  notif: NotificationItem;
  onMarkAsDone: (id: string) => void;
  onMarkAsUndone: (id: string) => void;
}

function getIconAndColor(type: NotificationType) {
  switch (type) {
    case "upvote_post":
      return { icon: ThumbsUp, bg: "#dbeafe", color: "#2563eb" };
    case "like_post":
      return { icon: Heart, bg: "#fce7f3", color: "#db2777" };
    case "reply_comment":
      return { icon: Reply, bg: "#e0e7ff", color: "#4f46e5" };
    case "reply_on_post":
      return { icon: Reply, bg: "#e0e7ff", color: "#4f46e5" };
    case "comment_post":
      return { icon: MessageSquare, bg: "#f3f4f6", color: "#4b5563" };
    case "accepted_answer":
      return { icon: CheckCircle, bg: "#dcfce7", color: "#16a34a" };
    case "follow_user":
      return { icon: UserPlus, bg: "#fef3c7", color: "#d97706" };
    case "complete_profile":
      return { icon: Settings, bg: "#f3e8ff", color: "#9333ea" };
    case "new_badge":
      return { icon: Award, bg: "#ffedd5", color: "#ea580c" };
    case "report_confirmed":
      return { icon: CheckCircle, bg: "#dcfce7", color: "#16a34a" };
    case "report_penalized":
      return { icon: Bell, bg: "#fee2e2", color: "#dc2626" };
    case "level_up":
      return { icon: TrendingUp, bg: "#dbeafe", color: "#2563eb" };
    default:
      return { icon: Bell, bg: "#f3f4f6", color: "#6b7280" };
  }
}

function ActorLink({ actor }: { actor: { id: string; username: string } | undefined }) {
  if (!actor) return null;
  return (
    <Link
      to={`/users/${actor.id}`}
      style={{ color: "#0d9488", fontWeight: 600, textDecoration: "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      {actor.username}
    </Link>
  );
}

function commentLink(notif: NotificationItem, label: ReactNode) {
  const postId = notif.post_id || notif.target_id;
  const hash = notif.target_type === "comment" && notif.target_id ? `#comment-${notif.target_id}` : "";
  return (
    <Link
      to={`/posts/${postId}${hash}`}
      style={{ color: "#0d9488", textDecoration: "none", fontWeight: 500 }}
    >
      {label}
    </Link>
  );
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notif,
  onMarkAsDone,
  onMarkAsUndone,
}) => {
  const { icon: Icon, bg, color } = getIconAndColor(notif.type);

  const renderContent = () => {
    switch (notif.type) {
      case "upvote_post":
        return (
          <>
            <ActorLink actor={notif.actor} /> memberi upvote pada postinganmu{" "}
            {commentLink(notif, `"${notif.target_title}"`)}
          </>
        );
      case "like_post":
        return (
          <>
            <ActorLink actor={notif.actor} /> menyukai postinganmu{" "}
            {commentLink(notif, `"${notif.target_title}"`)}
          </>
        );
      case "reply_comment":
        return (
          <>
            <ActorLink actor={notif.actor} /> membalas komentarmu:{" "}
            {commentLink(notif, <em>"{notif.message}"</em>)}
          </>
        );
      case "reply_on_post":
        return (
          <>
            <ActorLink actor={notif.actor} /> membalas postinganmu:{" "}
            {commentLink(notif, <em>"{notif.message}"</em>)}
          </>
        );
      case "comment_post":
        return (
          <>
            <ActorLink actor={notif.actor} /> mengomentari postinganmu{" "}
            {commentLink(notif, `"${notif.target_title}"`)}:{" "}
            <em>"{notif.message}"</em>
          </>
        );
      case "accepted_answer":
        return (
          <>
            Jawabanmu ditandai sebagai jawaban benar oleh <ActorLink actor={notif.actor} /> di{" "}
            {commentLink(notif, `"${notif.target_title}"`)}!
          </>
        );
      case "follow_user":
        return (
          <>
            <ActorLink actor={notif.actor} /> mulai mengikuti kamu.
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
      case "report_confirmed":
        return (
          <>
            Laporanmu telah ditindaklanjuti oleh admin.
            {notif.message && <> <em>"{notif.message}"</em></>}
          </>
        );
      case "report_penalized":
        return (
          <>
            Kontenmu kena sanksi karena melanggar aturan. {notif.message && <em>"{notif.message}"</em>}
          </>
        );
      case "level_up":
        return (
          <>
            Naik level! Sekarang kamu Level <strong>{notif.message}</strong>
          </>
        );
      default:
        return <span>{notif.message}</span>;
    }
  };

  return (
    <div className={`notif-item ${!notif.is_read ? "unread" : ""}`}>
      <div className="notif-icon" style={{ backgroundColor: bg, color }}>
        <Icon size={18} />
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
            <CheckCircle size={14} style={{ marginRight: 4 }} /> Selesai
          </button>
        ) : (
          <button
            className="btn-action"
            onClick={() => onMarkAsUndone(notif.id)}
            title="Kembalikan ke Inbox"
          >
            <ArrowLeft size={14} style={{ marginRight: 4 }} /> Inbox
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItemComponent;
