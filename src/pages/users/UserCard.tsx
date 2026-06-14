import { Link } from "react-router-dom";
import FollowButton from "../follow/FollowButton";

export interface UserItem {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  is_following?: boolean;
  created_at: string;
  updated_at: string;
}

function timeJoined(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UserCard({ user }: { user: UserItem }) {
  return (
    <div
      style={{
        border: "1px solid var(--black-100)",
        borderRadius: 6,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--orange)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,148,136,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--black-100)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Link
        to={`/users/${user.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 14,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--black-100)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 20, fontWeight: 600, color: "var(--black-500)" }}>
              {user.username[0].toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--orange)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.username}
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--black-700)" }}>
              {user.reputation_points.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: "var(--black-500)" }}>rep</span>
          </span>
          <span style={{ fontSize: 11, color: "var(--black-300)" }}>
            Joined {timeJoined(user.created_at)}
          </span>
        </div>
      </Link>

      {/* Follow button terpisah dari Link */}
      <div
        style={{
          padding: "8px 14px 12px",
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid var(--black-100)",
        }}
      >
        <FollowButton
          userId={user.id}
          initialIsFollowing={user.is_following ?? false}
          size="sm"
        />
      </div>
    </div>
  );
}