import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useEditProfile } from "../../hooks/useEditProfile";
import { useChangePassword } from "../../hooks/useChangePassword";

type Tab = "profile" | "password";

function Alert({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 14,
        background: type === "success" ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${type === "success" ? "#86efac" : "#fca5a5"}`,
        color: type === "success" ? "#15803d" : "#dc2626",
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 18,
          color: "inherit",
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
}

function AvatarPreview({
  url,
  username,
}: {
  url: string | null;
  username: string;
}) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid #818cf8",
        flexShrink: 0,
        background: "#e0e7ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        fontWeight: 600,
        color: "#4f46e5",
      }}
    >
      {url ? (
        <img
          src={url}
          alt={username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initial
      )}
    </div>
  );
}

function ProfileTab() {
  const { user, setUser } = useAuth();
  const { isLoading, error, success, submit, reset } = useEditProfile();

  const [username, setUsername] = useState(() => user?.username ?? "");
  const [bio, setBio] = useState(() => user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => user?.avatar_url ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    () => user?.avatar_url ?? null,
  );

  useEffect(() => {
    const trimmed = avatarUrl.trim();
    const t = setTimeout(() => {
      setPreviewUrl(trimmed ? avatarUrl : null);
    }, 600);
    return () => clearTimeout(t);
  }, [avatarUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    const payload: Record<string, string | null | undefined> = {};
    if (username !== user?.username) payload.username = username;
    if (bio !== (user?.bio ?? "")) payload.bio = bio || null;
    if (avatarUrl !== (user?.avatar_url ?? ""))
      payload.avatar_url = avatarUrl || null;
    if (Object.keys(payload).length === 0) return;
    const updated = await submit(payload);
    if (updated) {
      setUser(updated);
      setUsername(updated.username);
      setBio(updated.bio ?? "");
      setAvatarUrl(updated.avatar_url ?? "");
      setPreviewUrl(updated.avatar_url ?? null);
    }
  }

  const charLeft = 500 - bio.length;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <AvatarPreview url={previewUrl} username={username || "U"} />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            URL Avatar
          </label>
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            style={{
              padding: "9px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Paste URL gambar profil kamu
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={100}
          required
          style={{
            padding: "9px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Ceritain sedikit tentang diri kamu..."
          style={{
            padding: "9px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            resize: "vertical",
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: charLeft < 50 ? "#f59e0b" : "#9ca3af",
            textAlign: "right",
          }}
        >
          {charLeft} karakter tersisa
        </span>
      </div>

      {error && <Alert type="error" message={error} onClose={reset} />}
      {success && <Alert type="success" message={success} onClose={reset} />}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          alignSelf: "flex-start",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

function PasswordTab() {
  const { logout } = useAuth();
  const { isLoading, error, success, submit, reset } = useChangePassword();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const strength = (() => {
    if (!next) return 0;
    let s = 0;
    if (next.length >= 8) s++;
    if (/[A-Z]/.test(next)) s++;
    if (/[0-9]/.test(next)) s++;
    if (/[^A-Za-z0-9]/.test(next)) s++;
    return s;
  })();

  const strengthLabel = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981", "#10b981"][
    strength
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    const ok = await submit({
      current_password: current,
      new_password: next,
      new_password_confirmation: confirm,
    });
    if (ok) setTimeout(() => logout(), 2000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Password Sekarang
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "9px 40px 9px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#9ca3af",
            }}
          >
            {showCurrent ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Password Baru
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showNew ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            style={{
              width: "100%",
              padding: "9px 40px 9px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#9ca3af",
            }}
          >
            {showNew ? "🙈" : "👁"}
          </button>
        </div>
        {next && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                background: "#e5e7eb",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${strength * 25}%`,
                  background: strengthColor,
                  borderRadius: 4,
                  transition: "all .3s",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: strengthColor, minWidth: 72 }}>
              {strengthLabel}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Konfirmasi Password Baru
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          style={{
            padding: "9px 12px",
            border: `1px solid ${confirm && confirm !== next ? "#f87171" : "#e5e7eb"}`,
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
          }}
        />
        {confirm && confirm !== next && (
          <span style={{ fontSize: 12, color: "#ef4444" }}>
            Password tidak cocok
          </span>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={reset} />}
      {success && (
        <Alert
          type="success"
          message={`${success} Mengalihkan ke login...`}
          onClose={reset}
        />
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          alignSelf: "flex-start",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? "Memproses..." : "Ganti Password"}
      </button>
    </form>
  );
}

export default function EditProfilePage() {
  const { user } = useAuth(); // hapus authLoading, tidak ada di context kamu
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (!user)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        Kamu belum login.
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        padding: 40,
        maxWidth: 1000,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <aside style={{ width: 220, flexShrink: 0 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            textAlign: "center",
            position: "sticky",
            top: 40,
          }}
        >
          <AvatarPreview url={user.avatar_url} username={user.username} />
          <p style={{ fontWeight: 600, fontSize: 15 }}>@{user.username}</p>
          <p style={{ fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>
            {user.email}
          </p>
          <span
            style={{
              fontSize: 12,
              background: "#ede9fe",
              color: "#6d28d9",
              borderRadius: 20,
              padding: "3px 12px",
            }}
          >
            ⭐ {user.reputation_points.toLocaleString()} poin
          </span>
          {user.bio && (
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              {user.bio}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {user.roles?.map((r) => (
              <span
                key={r.id}
                style={{
                  fontSize: 11,
                  padding: "2px 10px",
                  borderRadius: 20,
                  background:
                    r.name === "admin"
                      ? "#fee2e2"
                      : r.name === "moderator"
                        ? "#fef3c7"
                        : "#ede9fe",
                  color:
                    r.name === "admin"
                      ? "#dc2626"
                      : r.name === "moderator"
                        ? "#d97706"
                        : "#6d28d9",
                }}
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pengaturan Akun</h1>
          <p style={{ color: "#6b7280", marginTop: 4 }}>
            Kelola informasi profil dan keamanan akun kamu
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: "#f3f4f6",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
            marginBottom: 20,
          }}
        >
          {(["profile", "password"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#fff" : "transparent",
                border: activeTab === tab ? "1px solid #e5e7eb" : "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#111827" : "#6b7280",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {tab === "profile" ? "👤 Edit Profil" : "🔒 Ganti Password"}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 28,
          }}
        >
          {activeTab === "profile" ? <ProfileTab /> : <PasswordTab />}
        </div>
      </main>
    </div>
  );
}
