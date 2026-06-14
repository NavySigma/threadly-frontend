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
<<<<<<< HEAD
    <div
      style={{
        border: "1px solid var(--black-100)",
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col transition-all bg-white">
          <Link
            to={`/users/${user.id}`}
            className="flex items-center gap-3 p-4 no-underline text-inherit"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
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

            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-sm text-teal-700 truncate">
                {user.username}
              </span>

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
          </Link>

          <div className="px-3 py-2 flex justify-end border-t border-gray-100">
            <FollowButton
              userId={user.id}
              initialIsFollowing={user.is_following ?? false}
              size="sm"
            />
          </div>
        </div>
              {user.reputation_points.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-400">rep</span>
          </span>
          <span style={{ fontSize: 11, color: "var(--black-300)" }}>
            Joined {timeJoined(user.created_at)}
          </span>
        </div>
      </Link>

<<<<<<< HEAD
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
=======
        <span className="text-[11px] text-gray-400">
          Joined {timeJoined(user.created_at)}
        </span>
>>>>>>> fd389ee8a69efe6e1020f2d7f036664e73329d49
      </div>
    </div>
  );
}
