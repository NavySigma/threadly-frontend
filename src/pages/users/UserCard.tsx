import { useNavigate } from "react-router-dom";
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
  role_name?: string;
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

export default function UserCard({
  user,
  currentUserId,
}: {
  user: UserItem;
  currentUserId?: string;
}) {
  const navigate = useNavigate();
  const isSelf = currentUserId === user.id;
  const isAdmin = user.role_name === "admin";
  const isModerator = user.role_name === "moderator";
  const badge = isAdmin ? "👑" : isModerator ? "🛡️" : null;

  return (
    <div
      onClick={() => navigate(`/users/${user.id}`)}
      className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 p-4 flex-1">
        <div className="relative w-12 h-12 shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-400">
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          {badge && (
            <span className="absolute -top-2 -right-2 text-2xl leading-none drop-shadow-md rotate-29">
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="font-semibold text-sm text-teal-700 truncate">
            {user.username}
          </span>

          {user.bio && (
            <span className="text-xs text-gray-500 line-clamp-2">
              {user.bio}
            </span>
          )}

          <div className="flex gap-2.5">
            <span className="flex items-baseline gap-1">
              <span className="font-semibold text-sm text-gray-700">
                {user.reputation_points.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-400">rep</span>
            </span>
            <span className="text-[11px] text-gray-400">
              Joined {timeJoined(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs text-[#0d9488] font-medium">
          Lihat selengkapnya &raquo;
        </span>
        {!isSelf && (
          <div onClick={(e) => e.stopPropagation()}>
            <FollowButton
              userId={user.id}
              initialIsFollowing={user.is_following ?? false}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
