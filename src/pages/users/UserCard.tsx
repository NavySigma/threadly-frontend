import { Link } from "react-router-dom";

export interface UserItem {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation?: number;
  posts_count?: number;
  created_at: string;
}

function timeJoined(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}

export default function UserCard({ user }: { user: UserItem }) {
  return (
    <Link to={`/users/${user.id}`} className="user-card">
      <div className="user-card-avatar">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span className="user-card-avatar-fallback">{user.username[0].toUpperCase()}</span>
        )}
      </div>
      <div className="user-card-info">
        <span className="user-card-name">{user.username}</span>
        <div className="user-card-stats">
          {user.reputation !== undefined && (
            <span className="user-stat">
              <span className="user-stat-value">{user.reputation.toLocaleString()}</span>
              <span className="user-stat-label">rep</span>
            </span>
          )}
          {user.posts_count !== undefined && (
            <span className="user-stat">
              <span className="user-stat-value">{user.posts_count}</span>
              <span className="user-stat-label">posts</span>
            </span>
          )}
        </div>
        <span className="user-card-joined">Joined {timeJoined(user.created_at)}</span>
      </div>
    </Link>
  );
}