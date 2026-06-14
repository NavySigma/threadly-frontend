import { useEffect, useReducer, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { fetchPublicProfile, type PublicUser } from "../../api/followApi";
import FollowButton from "../follow/FollowButton";
import FollowersModal from "../follow/FollowersModal";

type ModalMode = "followers" | "following" | null;

type State = {
  user: PublicUser | null;
  isLoading: boolean;
  notFound: boolean;
  followersCount: number;
  followingCount: number;
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; user: PublicUser }
  | { type: "FETCH_ERROR" }
  | { type: "UPDATE_FOLLOWERS"; delta: number };

const initialState: State = {
  user: null,
  isLoading: true,
  notFound: false,
  followersCount: 0,
  followingCount: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...initialState, isLoading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        user: action.user,
        isLoading: false,
        followersCount: action.user.followers_count,
        followingCount: action.user.following_count,
      };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, notFound: true };
    case "UPDATE_FOLLOWERS":
      return {
        ...state,
        followersCount: Math.max(0, state.followersCount + action.delta),
      };
    default:
      return state;
  }
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [{ user, isLoading, notFound, followersCount, followingCount }, dispatch] =
    useReducer(reducer, initialState);
  const [modal, setModal] = useState<ModalMode>(null);

  useEffect(() => {
    if (!userId) return;
    dispatch({ type: "FETCH_START" }); // ✅ satu dispatch, bukan banyak setState
    fetchPublicProfile(userId)
      .then((res) => dispatch({ type: "FETCH_SUCCESS", user: res.data }))
      .catch(() => dispatch({ type: "FETCH_ERROR" }));
  }, [userId]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <div
          className="spinner"
          style={{ width: 24, height: 24, borderColor: "var(--black-200)", borderTopColor: "var(--orange)" }}
        />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>User tidak ditemukan</h3>
        <p style={{ marginBottom: 16 }}>Profil ini tidak ada atau sudah dihapus.</p>
        <Link to="/users" className="btn btn-orange" style={{ display: "inline-flex" }}>
          ← Kembali ke Users
        </Link>
      </div>
    );
  }

  const joinedDate = new Date(user.created_at).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <Link
        to="/users"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          color: "var(--black-500)",
          textDecoration: "none",
          marginBottom: 16,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--orange)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--black-500)"; }}
      >
        <ArrowLeft size={13} />
        Users
      </Link>

      <div
        style={{
          border: "1px solid var(--black-100)",
          borderRadius: 6,
          background: "var(--white)",
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 6,
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
              <span style={{ fontSize: 32, fontWeight: 700, color: "var(--black-400)" }}>
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "var(--black-700)" }}>
                {user.username}
              </h1>
              <FollowButton
                userId={user.id}
                initialIsFollowing={false}
                onFollowChange={(isFollowing) =>
                  dispatch({ type: "UPDATE_FOLLOWERS", delta: isFollowing ? 1 : -1 })
                }
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--black-300)", marginBottom: 10 }}>
              <Calendar size={12} />
              Member sejak {joinedDate}
            </div>

            {user.bio && (
              <p style={{ fontSize: 13, color: "var(--black-500)", lineHeight: 1.6, marginBottom: 12 }}>
                {user.bio}
              </p>
            )}

            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => setModal("followers")}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: "var(--sans)", color: "var(--black-700)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--orange)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--black-700)"; }}
              >
                <strong>{followersCount.toLocaleString()}</strong>
                <span style={{ color: "var(--black-400)", marginLeft: 4 }}>followers</span>
              </button>

              <button
                onClick={() => setModal("following")}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: "var(--sans)", color: "var(--black-700)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--orange)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--black-700)"; }}
              >
                <strong>{followingCount.toLocaleString()}</strong>
                <span style={{ color: "var(--black-400)", marginLeft: 4 }}>following</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "reputation", value: user.reputation_points.toLocaleString() },
          { label: "posts", value: user.posts_count.toLocaleString() },
          { label: user.level_title ?? `Level ${user.level}`, value: `Level ${user.level}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              border: "1px solid var(--black-100)",
              borderRadius: 6,
              background: "var(--white)",
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 20, color: "var(--black-700)" }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--black-400)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {user.level_title && (
        <div
          style={{
            border: "1px solid var(--black-100)",
            borderRadius: 6,
            background: "var(--white)",
            padding: "16px 20px",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--black-500)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Rank
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              🏆
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--black-700)", margin: 0 }}>
                {user.level_title}
              </p>
              <p style={{ fontSize: 12, color: "var(--black-400)", margin: "2px 0 0" }}>
                Level {user.level}
              </p>
            </div>
          </div>
        </div>
      )}

      {modal && userId && (
        <FollowersModal
          userId={userId}
          mode={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}