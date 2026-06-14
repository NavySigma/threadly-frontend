import { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { fetchFollowers, fetchFollowing, type FollowUser } from "../../api/followApi";
import FollowButton from "./FollowButton";

interface FollowersModalProps {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
}

type State = {
  users: FollowUser[];
  count: number;
  isLoading: boolean;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; users: FollowUser[]; count: number }
  | { type: "FETCH_ERROR" };

const initialState: State = { users: [], count: 0, isLoading: true };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { users: [], count: 0, isLoading: true };
    case "FETCH_SUCCESS":
      return { users: action.users, count: action.count, isLoading: false };
    case "FETCH_ERROR":
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export default function FollowersModal({ userId, mode, onClose }: FollowersModalProps) {
  const [{ users, count, isLoading }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "FETCH_START" }); // ✅ satu dispatch, bukan banyak setState
    const fn = mode === "followers" ? fetchFollowers : fetchFollowing;
    fn(userId)
      .then((res) => {
        dispatch({
          type: "FETCH_SUCCESS",
          users: res.data,
          count:
            "followers_count" in res.meta
              ? (res.meta as { followers_count: number }).followers_count
              : (res.meta as { following_count: number }).following_count,
        });
      })
      .catch(() => dispatch({ type: "FETCH_ERROR" }));
  }, [userId, mode]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--white)",
          borderRadius: 6,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--black-100)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--black-700)" }}>
            {mode === "followers" ? "Followers" : "Following"}
            <span style={{ marginLeft: 6, fontWeight: 400, color: "var(--black-300)", fontSize: 12 }}>
              ({count})
            </span>
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--black-500)",
              display: "flex",
              alignItems: "center",
              padding: 4,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--black-075)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <div
                className="spinner"
                style={{ width: 20, height: 20, borderColor: "var(--black-200)", borderTopColor: "var(--orange)" }}
              />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--black-400)", fontSize: 13 }}>
              {mode === "followers" ? "Belum ada followers." : "Belum following siapapun."}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--black-100)",
                  gap: 8,
                }}
              >
                <Link
                  to={`/users/${user.id}`}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    color: "inherit",
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--black-100)",
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--black-500)" }}>
                        {user.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--orange)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--black-300)", margin: "2px 0 0" }}>
                      {user.reputation_points.toLocaleString()} rep
                    </p>
                  </div>
                </Link>
                <FollowButton userId={user.id} initialIsFollowing={false} size="sm" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}