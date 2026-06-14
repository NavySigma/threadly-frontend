import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchFollowers,
  fetchFollowing,
  type FollowUser,
} from "../../api/followApi";

interface Props {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
}

interface FollowMeta {
  followers_count?: number;
  following_count?: number;
}

interface FollowResponse {
  data: FollowUser[];
  meta: FollowMeta;
}

export default function FollowersModal({ userId, mode, onClose }: Props) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fn = mode === "followers" ? fetchFollowers : fetchFollowing;
      const res = (await fn(userId)) as FollowResponse;
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
      setCount(
        mode === "followers"
          ? (res.meta?.followers_count ?? list.length)
          : (res.meta?.following_count ?? list.length)
      );
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, mode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 400,
          maxWidth: "90vw",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
            {mode === "followers" ? "Followers" : "Following"}
            {count > 0 && (
              <span
                style={{ color: "#6b7280", fontWeight: 400, marginLeft: 6 }}
              >
                {count.toLocaleString()}
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              padding: 4,
              borderRadius: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {isLoading && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              Memuat...
            </div>
          )}

          {!isLoading && error && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#dc2626",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              {mode === "followers"
                ? "Belum ada followers."
                : "Belum mengikuti siapapun."}
            </div>
          )}

          {!isLoading &&
            !error &&
            users.map((u) => (
              <Link
                key={u.id}
                to={`/users/${u.id}`}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom: "1px solid #f3f4f6",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#c084fc",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#fff",
                  }}
                >
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    u.username[0].toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.username}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {u.reputation_points.toLocaleString()} rep
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}