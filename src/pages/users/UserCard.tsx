import { Link } from "react-router-dom";

export interface UserItem {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
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
    <Link
      to={`/users/${user.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        border: "1px solid var(--black-100)",
        borderRadius: 6,
        textDecoration: "none",
        color: "inherit",
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
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 600, color: "var(--black-500)" }}>
            {user.username[0].toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
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

        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--black-700)" }}>
              {user.reputation_points.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: "var(--black-500)" }}>rep</span>
          </span>
        </div>

        <span style={{ fontSize: 11, color: "var(--black-300)" }}>
          Joined {timeJoined(user.created_at)}
        </span>
      </div>
    </Link>
  );
}