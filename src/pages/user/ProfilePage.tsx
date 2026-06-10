import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type MainTab = "profile" | "activity";
type ActivityTab = "summary" | "answers" | "questions" | "tags" | "articles" | "badges" | "following" | "reputation";

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
    <div style={{ ...AVATAR_BASE, width: size, height: size, fontSize: Math.round(size * 0.35) }}>
      {url ? (
        <img
          src={url}
          alt={username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        getInitial(username)
      )}
    </div>
  );
}

function StatCard({ num, label }: { num: number; label: string }) {
  return (
    <div style={{
      background: "#f9fafb", borderRadius: 8, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 2,
    }}>
      <span style={{ fontSize: 22, fontWeight: 500, color: "inherit" }}>{num}</span>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      background: "#f9fafb", borderRadius: 8, padding: "32px 20px",
      textAlign: "center", color: "#9ca3af", fontSize: 14,
    }}>
      {message}
    </div>
  );
}

function ProfileContent({ user }: { user: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Stats */}
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard num={user.reputation_points ?? 1} label="reputation" />
          <StatCard num={0} label="reached" />
          <StatCard num={0} label="answers" />
          <StatCard num={0} label="questions" />
        </div>

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>Communities</p>
        <div style={{
          background: "#f9fafb", borderRadius: 8, padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 14, color: "#4f46e5" }}>Threadly</span>
          <span style={{ fontSize: 14, color: "#6b7280" }}>1</span>
        </div>
      </div>

      {/* About + Badges */}
      <div>
        <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 12px" }}>About</p>
        {user.bio ? (
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "16px", fontSize: 14, color: "inherit", lineHeight: 1.6 }}>
            {user.bio}
          </div>
        ) : (
          <div style={{
            background: "#f9fafb", borderRadius: 8, padding: "24px 16px",
            textAlign: "center", fontSize: 14, color: "#9ca3af",
          }}>
            Bagian about me kamu masih kosong.{" "}
            <span
              style={{ color: "#4f46e5", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => window.location.href = "/profile/edit"}
            >
              Edit profil
            </span>
          </div>
        )}

        <p style={{ fontSize: 17, fontWeight: 500, margin: "20px 0 12px" }}>Badges</p>
        <EmptyState message="Kamu belum punya badges." />
      </div>
    </div>
  );
}

function QuestionsContent() {
  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Questions</p>
      <EmptyState message="Kamu belum punya pertanyaan." />
    </div>
  );
}

function TagsContent() {
  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Tags</p>
      <EmptyState message="Kamu belum menggunakan tag apapun." />
    </div>
  );
}

function ActivityContent({ activeSubTab, setActiveSubTab }: {
  activeSubTab: ActivityTab;
  setActiveSubTab: (t: ActivityTab) => void;
}) {
  const subTabs: { key: ActivityTab; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "answers", label: "Answers" },
    { key: "questions", label: "Questions" },
    { key: "tags", label: "Tags" },
    { key: "articles", label: "Articles" },
    { key: "badges", label: "Badges" },
    { key: "following", label: "Following" },
    { key: "reputation", label: "Reputation" },
  ];

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* Sidebar sub-menu */}
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

      {/* Content area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {activeSubTab === "summary" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Summary</p>
            <EmptyState message="Belum ada aktivitas." />
          </div>
        )}
        {activeSubTab === "questions" && <QuestionsContent />}
        {activeSubTab === "tags" && <TagsContent />}
        {activeSubTab === "answers" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Answers</p>
            <EmptyState message="Kamu belum punya jawaban." />
          </div>
        )}
        {activeSubTab === "articles" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Articles</p>
            <EmptyState message="Kamu belum punya artikel." />
          </div>
        )}
        {activeSubTab === "badges" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Badges</p>
            <EmptyState message="Kamu belum punya badges." />
          </div>
        )}
        {activeSubTab === "following" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Following</p>
            <EmptyState message="Kamu belum mengikuti siapapun." />
          </div>
        )}
        {activeSubTab === "reputation" && (
          <div>
            <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>Reputation</p>
            <EmptyState message="Belum ada perubahan reputasi." />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>("profile");
  const [activityTab, setActivityTab] = useState<ActivityTab>("summary");

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#6b7280", fontSize: 14 }}>
        Kamu belum login.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 40px", fontFamily: "inherit", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
        <Avatar url={user.avatar_url} username={user.username} size={96} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>{user.username}</h1>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
              👤 Member sejak {new Date(user.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
            </span>
            <span style={{ fontSize: 13, color: "#6b7280" }}>✉️ {user.email}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate("/profile/edit")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", border: "0.5px solid #e5e7eb",
                borderRadius: 8, background: "transparent",
                fontSize: 13, color: "inherit", cursor: "pointer",
              }}
            >
              ✏️ Edit profil
            </button>
          </div>
        </div>
      </div>

      {/* Main tab switcher */}
      <div style={{ display: "flex", gap: 0, borderBottom: "0.5px solid #e5e7eb", marginBottom: 24 }}>
        {([
          { key: "profile", label: "Profile" },
          { key: "activity", label: "Activity" },
        ] as { key: MainTab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: mainTab === t.key ? "2px solid #f97316" : "2px solid transparent",
              background: mainTab === t.key ? "#fff7ed" : "transparent",
              fontSize: 14,
              fontWeight: mainTab === t.key ? 500 : 400,
              color: mainTab === t.key ? "#f97316" : "#6b7280",
              cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              transition: "all .15s",
            }}
          >
            {t.key === "activity" ? "🟠 " : ""}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {mainTab === "profile" && <ProfileContent user={user} />}
      {mainTab === "activity" && (
        <ActivityContent
          activeSubTab={activityTab}
          setActiveSubTab={setActivityTab}
        />
      )}
    </div>
  );
}