import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Edit2,
  Calendar,
  Trophy,
  Activity,
  Heart,
  MessageSquare,
  Tag,
  Award,
  TrendingUp,
  LogOut,
  Bookmark,
  CheckCircle,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { fetchPublicProfile, type PublicUser } from "../../api/followApi";
import FollowButton from "../follow/FollowButton";
import FollowersModal from "../follow/FollowersModal";
import { QuestionsTab } from "./QuestionsTab";
import { TagsTab } from "./TagsTab";
import { AnswersTab } from "./AnswersTab";
import { PointsHistoryView } from "./history/PointsHistoryPage";
import { useBookmarks } from "../../hooks/useBookmarks";
import { apiFetch } from "../../api/client";
import type { Post } from "../../types/posts";
import type { MainTab, ActivityTab } from "../../types/profile.type";

type ModalMode = "followers" | "following" | null;

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "U";
}

const AVATAR_BASE: React.CSSProperties = {
  borderRadius: 6,
  background: "#0d9488",
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

function StatCard({
  num,
  label,
  onClick,
}: {
  num: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#f9fafb",
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.background = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.background = "#f9fafb";
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

function SummaryStatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#f0fdfa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0d9488",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      </div>
    </div>
  );
}

function SummaryContent({ userId }: { userId: string }) {
  const { user } = useAuth();
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-summary", userId],
    queryFn: () => fetchPublicProfile(userId),
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div style={{ padding: "20px 0", color: "#6b7280", fontSize: 14 }}>
        Memuat ringkasan...
      </div>
    );

  const p = profileData?.data;

  if (!p) return null;

  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
        Summary
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SummaryStatCard
          icon={<TrendingUp size={18} />}
          value={p.reputation_points ?? 0}
          label="Reputation"
        />
        <SummaryStatCard
          icon={<MessageSquare size={18} />}
          value={p.posts_count ?? 0}
          label="Questions"
        />
        <SummaryStatCard
          icon={<MessageSquare size={18} />}
          value={p.comments_count ?? 0}
          label="Answers"
        />
        <SummaryStatCard
          icon={<CheckCircle size={18} />}
          value={p.accepted_count ?? 0}
          label="Accepted"
        />
        <SummaryStatCard
          icon={<Users size={18} />}
          value={p.followers_count ?? 0}
          label="Followers"
        />
        <SummaryStatCard
          icon={<Users size={18} />}
          value={p.following_count ?? 0}
          label="Following"
        />
      </div>
    </div>
  );
}

function ProfileContent({
  profileUser,
  isOwnProfile,
  onOpenModal,
}: {
  profileUser: PublicUser | null;
  isOwnProfile: boolean;
  onOpenModal: (mode: "followers" | "following") => void;
}) {
  const { user } = useAuth();
  const displayUser = profileUser ?? user;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard num={displayUser?.reputation_points ?? 0} label="reputation" />
          <StatCard num={(displayUser as PublicUser)?.posts_count ?? 0} label="posts" />
          <StatCard
            num={(displayUser as PublicUser)?.followers_count ?? 0}
            label="followers"
            onClick={() => onOpenModal("followers")}
          />
          <StatCard
            num={(displayUser as PublicUser)?.following_count ?? 0}
            label="following"
            onClick={() => onOpenModal("following")}
          />
        </div>

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>Communities</p>
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
          <a href="/" style={{ fontSize: 14, color: "#4f46e5", textDecoration: "none" }}>Threadly</a>
          <span style={{ fontSize: 14, color: "#6b7280" }}>1</span>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>About</p>
        {displayUser?.bio ? (
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "16px", fontSize: 14, lineHeight: 1.6 }}>
            {displayUser.bio}
          </div>
        ) : (
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "24px 16px", textAlign: "center", fontSize: 14, color: "#9ca3af" }}>
            {isOwnProfile ? (
              <>
                Bagian about me kamu masih kosong.{" "}
                <span
                  style={{ color: "#4f46e5", cursor: "pointer", textDecoration: "underline" }}
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

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>Rank</p>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#0d9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: "#fff",
                boxShadow: "0 2px 4px rgba(13, 148, 136, 0.2)",
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
                {displayUser?.level_title ?? "Newbie"}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Level {displayUser?.level ?? 1}
              </div>
            </div>
          </div>

          {displayUser?.next_level_points !== undefined && (
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#6b7280" }}>Progress ke level berikutnya</span>
                <span style={{ fontWeight: 600, color: "#0d9488" }}>
                  {displayUser.reputation_points} / {displayUser.next_level_points} pts
                </span>
              </div>
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#0d9488",
                    width: `${Math.min(100, (displayUser.reputation_points / (displayUser.next_level_points || 1)) * 100)}%`,
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityContent({
  activeSubTab,
  setActiveSubTab,
  userId,
  isOwnProfile,
}: {
  activeSubTab: ActivityTab;
  setActiveSubTab: (t: ActivityTab) => void;
  userId: string;
  isOwnProfile: boolean;
}) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Apakah kamu yakin ingin logout?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  const subTabs: { key: ActivityTab | "logout"; label: string; icon: React.ReactNode }[] = [
    { key: "summary",    label: "Summary",    icon: <Activity size={16} /> },
    { key: "answers",    label: "Answers",    icon: <MessageSquare size={16} /> },
    { key: "questions",  label: "Questions",  icon: <MessageSquare size={16} /> },
    { key: "tags",       label: "Tags",       icon: <Tag size={16} /> },
    { key: "badges",     label: "Rank",       icon: <Award size={16} /> },
    { key: "reputation", label: "Reputation", icon: <TrendingUp size={16} /> },
  ];

  if (isOwnProfile) {
    subTabs.push({ key: "logout", label: "Logout", icon: <LogOut size={16} /> });
  }

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {subTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (t.key === "logout") handleLogout();
                else setActiveSubTab(t.key as ActivityTab);
              }}
              style={{
                textAlign: "left",
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: activeSubTab === t.key ? 500 : 400,
                background: t.key === "logout" ? "transparent" : activeSubTab === t.key ? "#f3f4f6" : "transparent",
                color: t.key === "logout" ? "#dc2626" : activeSubTab === t.key ? "#111827" : "#6b7280",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseOver={(e) => {
                if (t.key === "logout") e.currentTarget.style.background = "#fef2f2";
                else e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseOut={(e) => {
                if (t.key === "logout") e.currentTarget.style.background = "transparent";
                else if (activeSubTab !== t.key) e.currentTarget.style.background = "transparent";
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {activeSubTab === "summary" && <SummaryContent userId={userId} />}
        {activeSubTab === "questions" && <QuestionsTab userId={userId} />}
        {activeSubTab === "tags" && <TagsTab userId={userId} />}
        {activeSubTab === "answers" && <AnswersTab userId={userId} />}
        {activeSubTab === "badges" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Rank</p>
            <EmptyState message="Belum punya rank." />
          </div>
        )}
        {activeSubTab === "reputation" && <PointsHistoryView />}
      </div>
    </div>
  );
}

interface LikedComment {
  id: string;
  target: {
    id: string;
    body: string;
    created_at: string;
    post: { id: string; title: string };
  };
}

function LikeCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#0d9488";
        e.currentTarget.style.background = "#f0fdfa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#0d9488",
          marginBottom: 6,
        }}
      >
        <FileText size={14} /> Postingan
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginBottom: 4 }}>
        {post.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#9ca3af" }}>
        <span style={{ fontWeight: 600, color: "#374151" }}>{post.vote_score} votes</span>
        <span>•</span>
        <span>{post.view_count} dilihat</span>
        <span>•</span>
        <span style={{ color: "#6b7280", fontWeight: 500 }}>{post.user?.username}</span>
      </div>
    </div>
  );
}

function LikedCommentCard({ comment, onClick }: { comment: LikedComment["target"]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#0d9488";
        e.currentTarget.style.background = "#f0fdfa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#8b5cf6",
          marginBottom: 6,
        }}
      >
        <MessageSquare size={14} /> Jawaban
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#0d9488", marginBottom: 4 }}>
        {comment.post?.title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {comment.body}
      </div>
    </div>
  );
}

function LikesContent() {
  const navigate = useNavigate();
  const postsQuery = useQuery({
    queryKey: ["liked-posts"],
    queryFn: () => apiFetch<{ data: { id: string; target: Post }[] }>("/me/bookmarks/posts"),
  });
  const commentsQuery = useQuery({
    queryKey: ["liked-comments"],
    queryFn: () => apiFetch<{ data: LikedComment[] }>("/me/bookmarks/comments"),
  });

  if (postsQuery.isLoading || commentsQuery.isLoading)
    return <div style={{ padding: "20px 0", color: "#6b7280", fontSize: 14 }}>Memuat...</div>;

  const posts = postsQuery.data?.data?.map((l) => l.target).filter(Boolean) ?? [];
  const comments = commentsQuery.data?.data?.map((l) => l.target).filter(Boolean) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>
          Postingan ({posts.length})
        </p>
        {posts.length === 0 ? (
          <EmptyState message="Belum ada postingan yang disukai." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {posts.map((p) => (
              <LikeCard key={p.id} post={p} onClick={() => navigate(`/posts/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>
          Jawaban ({comments.length})
        </p>
        {comments.length === 0 ? (
          <EmptyState message="Belum ada jawaban yang disukai." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {comments.map((c) => (
              <LikedCommentCard
                key={c.id}
                comment={c}
                onClick={() => navigate(`/posts/${c.post.id}#comment-${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookmarksContent() {
  const { bookmarks, isLoading, error } = useBookmarks();
  const navigate = useNavigate();

  if (isLoading) return <div style={{ padding: "20px 0", color: "#6b7280", fontSize: 14 }}>Memuat bookmark...</div>;
  if (error) return <div style={{ padding: "20px 0", color: "#dc2626", fontSize: 14 }}>{error}</div>;

  const posts = bookmarks.filter((b) => b.post).map((b) => b.post!);

  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
        Bookmarks ({posts.length})
      </p>
      {posts.length === 0 ? (
        <EmptyState message="Belum ada konten yang di-bookmark." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map((p) => (
            <LikeCard key={p.id} post={p} onClick={() => navigate(`/posts/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const isOwnProfile = !id || id === user?.id;
  const targetUserId = isOwnProfile ? user?.id : (id ?? "");

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as MainTab) || "profile";
  const initialSubTab = (searchParams.get("subtab") as ActivityTab) || "summary";
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [activityTab, setActivityTab] = useState<ActivityTab>(initialSubTab);

  useEffect(() => {
    if (isOwnProfile || !id) return;
    setLoadingProfile(true);
    fetchPublicProfile(id)
      .then((res) => setProfileUser(res.data))
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, [id, isOwnProfile]);

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#6b7280", fontSize: 14 }}>
        Kamu belum login.
      </div>
    );
  }

  if (!isOwnProfile && loadingProfile) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#6b7280", fontSize: 14 }}>
        Memuat profil...
      </div>
    );
  }

  const displayUsername   = isOwnProfile ? user.username   : (profileUser?.username   ?? "");
  const displayAvatarUrl  = isOwnProfile ? user.avatar_url : (profileUser?.avatar_url ?? null);
  const displayCreatedAt  = isOwnProfile ? user.created_at : (profileUser?.created_at ?? "");
  const displayEmail      = isOwnProfile ? user.email      : null;

  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",   label: "Profile",   icon: <User size={16} /> },
    { key: "activity",  label: "Activity",  icon: <Activity size={16} /> },
    { key: "likes",     label: "Likes",     icon: <Heart size={16} /> },
  ];

  if (isOwnProfile) {
    mainTabs.push({ key: "bookmarks", label: "Bookmarks", icon: <Bookmark size={16} /> });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 40px", fontFamily: "inherit", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
        <Avatar url={displayAvatarUrl} username={displayUsername} size={96} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>{displayUsername}</h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
            {displayCreatedAt && (
              <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={14} /> Member sejak{" "}
                {new Date(displayCreatedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
              </span>
            )}
            {displayEmail && (
              <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                <Mail size={14} /> {displayEmail}
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
                <Edit2 size={14} /> Edit profil
              </button>
            ) : (
              <FollowButton
                key={profileUser?.id}
                userId={targetUserId ?? ""}
                initialIsFollowing={profileUser?.is_following ?? false}
                onFollowChange={(isNowFollowing) => {
                  setProfileUser((prev) =>
                    prev
                      ? { ...prev, followers_count: prev.followers_count + (isNowFollowing ? 1 : -1) }
                      : prev
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #e5e7eb", marginBottom: 24 }}>
        {mainTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: mainTab === t.key ? "2px solid #0d9488" : "2px solid transparent",
              background: mainTab === t.key ? "#f0fdfa" : "transparent",
              fontSize: 14,
              fontWeight: mainTab === t.key ? 500 : 400,
              color: mainTab === t.key ? "#0d9488" : "#6b7280",
              cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              transition: "all .15s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {mainTab === "profile" && (
        <ProfileContent
          profileUser={isOwnProfile ? null : profileUser}
          isOwnProfile={isOwnProfile}
          onOpenModal={(mode) => setModal(mode)}
        />
      )}
      {mainTab === "activity" && (
        <ActivityContent
          activeSubTab={activityTab}
          setActiveSubTab={setActivityTab}
          userId={targetUserId ?? ""}
          isOwnProfile={isOwnProfile}
        />
      )}
      {mainTab === "likes" && <LikesContent />}
      {mainTab === "bookmarks" && <BookmarksContent />}

      {/* Modal followers/following */}
      {modal && targetUserId && (
        <FollowersModal
          userId={targetUserId}
          mode={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}