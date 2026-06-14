import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useFollow } from "../../hooks/useFollow";
import { fetchPublicProfile, type PublicUser } from "../../api/followApi";
import QuestionsTab from "./post/Questionstab";
import type { MainTab, ActivityTab } from "../../types/profile.type";

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "U";
}

const AVATAR_BASE: React.CSSProperties = {
  borderRadius: 6,
  background: "#c084fc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  color: "#fff",
  overflow: "hidden",
  flexShrink: 0,
};

function Avatar({
  url,
  username,
  size = 80,
}: {
  url: string | null | undefined;
  username: string;
  size?: number;
}) {
  return (
    <div
      style={{
        ...AVATAR_BASE,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.35),
      }}
    >
      {url ? (
        <img
          src={url}
          alt={username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        getInitial(username)
      )}
    </div>
  );
}

function StatCard({ num, label }: { num: number; label: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 500 }}>{num}</span>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 8,
        padding: "32px 20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

function ProfileContent({
  profileUser,
  isOwnProfile,
}: {
  profileUser: PublicUser | null;
  isOwnProfile: boolean;
}) {
  const { user } = useAuth();
  const displayUser = profileUser ?? user;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>
          Stats
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <StatCard
            num={displayUser?.reputation_points ?? 0}
            label="reputation"
          />
          <StatCard
            num={(displayUser as PublicUser)?.posts_count ?? 0}
            label="posts"
          />
          <StatCard
            num={(displayUser as PublicUser)?.followers_count ?? 0}
            label="followers"
          />
          <StatCard
            num={(displayUser as PublicUser)?.following_count ?? 0}
            label="following"
          />
        </div>

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>
          Communities
        </p>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, color: "#4f46e5" }}>Threadly</span>
          <span style={{ fontSize: 14, color: "#6b7280" }}>1</span>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>
          About
        </p>
        {displayUser?.bio ? (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: "16px",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {displayUser.bio}
          </div>
        ) : (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: "24px 16px",
              textAlign: "center",
              fontSize: 14,
              color: "#9ca3af",
            }}
          >
            {isOwnProfile ? (
              <>
                Bagian about me kamu masih kosong.{" "}
                <span
                  style={{
                    color: "#4f46e5",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => (window.location.href = "/profile/edit")}
                >
                  Edit profil
                </span>
              </>
            ) : (
              "User ini belum mengisi bio."
            )}
          </div>
        )}

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>
          Rank
        </p>
        <EmptyState message="Belum punya rank." />
      </div>
    </div>
  );
}

// ← isOwnProfile ditambahkan sebagai prop
function ActivityContent({
  activeSubTab,
  setActiveSubTab,
  isOwnProfile,
}: {
  activeSubTab: ActivityTab;
  setActiveSubTab: (t: ActivityTab) => void;
  isOwnProfile: boolean;
}) {
  const subTabs: { key: ActivityTab; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "answers", label: "Answers" },
    { key: "questions", label: "Questions" },
    { key: "tags", label: "Tags" },
    { key: "badges", label: "Rank" },
    { key: "reputation", label: "Reputation" },
  ];

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {subTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveSubTab(t.key)}
              style={{
                textAlign: "left",
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: activeSubTab === t.key ? 500 : 400,
                background: activeSubTab === t.key ? "#f3f4f6" : "transparent",
                color: activeSubTab === t.key ? "#111827" : "#6b7280",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {activeSubTab === "summary" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Summary
            </p>
            <EmptyState message="Belum ada aktivitas." />
          </div>
        )}

        {activeSubTab === "questions" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Questions
            </p>
            {/* ← QuestionsTab hanya untuk profil sendiri */}
            {isOwnProfile ? (
              <QuestionsTab />
            ) : (
              <EmptyState message="Belum ada pertanyaan." />
            )}
          </div>
        )}

        {activeSubTab === "tags" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Tags
            </p>
            <EmptyState message="Belum menggunakan tag apapun." />
          </div>
        )}

        {activeSubTab === "answers" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Answers
            </p>
            <EmptyState message="Belum ada jawaban." />
          </div>
        )}

        {activeSubTab === "badges" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Rank
            </p>
            <EmptyState message="Belum punya rank." />
          </div>
        )}

        {activeSubTab === "reputation" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
              Reputation
            </p>
            <EmptyState message="Belum ada perubahan reputasi." />
          </div>
        )}
      </div>
    </div>
  );
}

function LikesContent() {
  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Likes</p>
      <EmptyState message="Belum ada konten yang disukai." />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const isOwnProfile = !id || id === user?.id;

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { isFollowing, isLoading: followLoading, toggle } = useFollow(false);

  const [mainTab, setMainTab] = useState<MainTab>("profile");
  const [activityTab, setActivityTab] = useState<ActivityTab>("summary");

  useEffect(() => {
    if (isOwnProfile || !id) return;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const res = await fetchPublicProfile(id!);
        setProfileUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [id, isOwnProfile]);

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Kamu belum login.
      </div>
    );
  }

  if (!isOwnProfile && loadingProfile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Memuat profil...
      </div>
    );
  }

  const displayUsername = isOwnProfile
    ? user.username
    : (profileUser?.username ?? "");
  const displayAvatarUrl = isOwnProfile
    ? user.avatar_url
    : (profileUser?.avatar_url ?? null);
  const displayCreatedAt = isOwnProfile
    ? user.created_at
    : (profileUser?.created_at ?? "");
  const displayEmail = isOwnProfile ? user.email : null;
  const targetUserId = isOwnProfile ? user.id : (id ?? "");

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "activity", label: "🟠 Activity" },
    { key: "likes", label: "❤️ Likes" },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "36px 40px",
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Avatar url={displayAvatarUrl} username={displayUsername} size={96} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>
            {displayUsername}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {displayCreatedAt && (
              <span
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                👤 Member sejak{" "}
                {new Date(displayCreatedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
            {displayEmail && (
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                ✉️ {displayEmail}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {isOwnProfile ? (
              <button
                onClick={() => navigate("/profile/edit")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 8,
                  background: "transparent",
                  fontSize: 13,
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit profil
              </button>
            ) : (
              <button
                onClick={() => toggle(targetUserId)}
                disabled={followLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  border: isFollowing ? "0.5px solid #e5e7eb" : "none",
                  borderRadius: 8,
                  background: isFollowing ? "transparent" : "#4f46e5",
                  color: isFollowing ? "#374151" : "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: followLoading ? "not-allowed" : "pointer",
                  opacity: followLoading ? 0.7 : 1,
                  transition: "all .15s",
                }}
              >
                {followLoading
                  ? "..."
                  : isFollowing
                    ? "✓ Following"
                    : "+ Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "0.5px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        {mainTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                mainTab === t.key
                  ? "2px solid #f97316"
                  : "2px solid transparent",
              background: mainTab === t.key ? "#fff7ed" : "transparent",
              fontSize: 14,
              fontWeight: mainTab === t.key ? 500 : 400,
              color: mainTab === t.key ? "#f97316" : "#6b7280",
              cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {mainTab === "profile" && (
        <ProfileContent
          profileUser={isOwnProfile ? null : profileUser}
          isOwnProfile={isOwnProfile}
        />
      )}
      {mainTab === "activity" && (
        <ActivityContent
          activeSubTab={activityTab}
          setActiveSubTab={setActivityTab}
          isOwnProfile={isOwnProfile} // ← tambahan
        />
      )}
      {mainTab === "likes" && <LikesContent />}
    </div>
  );
}