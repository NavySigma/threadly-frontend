import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useChangePassword } from "../../hooks/useChangePassword";

import type { UpdatePasswordPayload } from "../../api/userApi";

import { ProfileFormik } from "./ProfileFormik";

type Tab = "profile" | "password";

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
  size = 72,
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

function Alert({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const isSuccess = type === "success";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        background: isSuccess ? "#f0fdf4" : "#fef2f2",
        border: `0.5px solid ${isSuccess ? "#86efac" : "#fca5a5"}`,
        color: isSuccess ? "#15803d" : "#dc2626",
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  padding: "9px 12px",
  border: "0.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: "inherit",
  background: "transparent",
  fontFamily: "inherit",
};

const saveBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 24px",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function ProfileTab() {
  return <ProfileFormik />;
}

function strengthScore(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ["", "Lemah", "Cukup", "Kuat", "Sangat kuat"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#10b981", "#10b981"];

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  borderColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  borderColor?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={fieldLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          style={{
            ...inputStyle,
            paddingRight: 40,
            borderColor: borderColor ?? "#d1d5db",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: "#9ca3af",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PasswordTab() {
  const { user, login, logout } = useAuth();
  const { isLoading, error, success, submit, reset } = useChangePassword();

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);

  const score = strengthScore(next);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    const payload: UpdatePasswordPayload = {
      new_password: next,
      new_password_confirmation: confirm,
    };
    const ok = await submit(payload);

    if (ok) {
      if (user?.email) {
        try {
          // Re-login diam-diam pakai password baru,
          // supaya token diperbarui tanpa perlu user login manual lagi.
          await login({ email: user.email, password: next });
        } catch (err) {
          console.warn("Auto re-login gagal:", err);
          // Fallback: kalau auto re-login gagal, baru logout
          logout();
        }
      } else {
        // fallback kalau data user/email tidak tersedia
        logout();
      }

      setNext("");
      setConfirm("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Password baru */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <PasswordField
          label="Password baru"
          value={next}
          onChange={setNext}
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
          autoComplete="new-password"
        />
        {next && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
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
                  width: `${score * 25}%`,
                  background: STRENGTH_COLORS[score],
                  borderRadius: 4,
                  transition: "all .3s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: STRENGTH_COLORS[score],
                minWidth: 72,
              }}
            >
              {STRENGTH_LABELS[score]}
            </span>
          </div>
        )}
      </div>

      {/* Konfirmasi password baru */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={fieldLabel}>Konfirmasi password baru</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          style={{
            ...inputStyle,
            borderColor: confirm && confirm !== next ? "#f87171" : "#d1d5db",
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
        <Alert type="success" message={success} onClose={reset} />
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          ...saveBtnStyle,
          background: "#0d9488",
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Memproses..." : "Ganti password"}
      </button>
    </form>
  );
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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

  return (
    <div
      style={{
        display: "flex",
        gap: 28,
        padding: "36px 40px",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <aside style={{ width: 200, flexShrink: 0 }}>
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #e5e7eb",
            borderRadius: 12,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            textAlign: "center",
            position: "sticky",
            top: 36,
          }}
        >
          <Avatar url={user.avatar_url} username={user.username} size={72} />
          <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>
            @{user.username}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              wordBreak: "break-all",
              margin: 0,
            }}
          >
            {user.email}
          </p>
          <span
            style={{
              fontSize: 12,
              background: "#f0fdfa",
              color: "#0d9488",
              borderRadius: 20,
              padding: "3px 12px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Sparkles size={12} /> {user.reputation_points.toLocaleString()} poin
          </span>
          {user.bio && (
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
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
                  background: "#f0fdfa",
                  color: "#0d9488",
                }}
              >
                {r.name}
              </span>
            ))}
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "7px 0",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              background: "transparent",
              fontSize: 13,
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>
            Pengaturan akun
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            Kelola informasi profil dan keamanan akun kamu
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: "#f3f4f6",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
            marginBottom: 20,
            gap: 2,
          }}
        >
          {(["profile", "password"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#fff" : "transparent",
                border: activeTab === tab ? "0.5px solid #e5e7eb" : "none",
                borderRadius: 8,
                padding: "7px 18px",
                fontSize: 13,
                fontWeight: activeTab === tab ? 500 : 400,
                color: activeTab === tab ? "#111827" : "#6b7280",
                cursor: "pointer",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab === "profile" ? (
                <>
                  <User size={14} /> Edit profil
                </>
              ) : (
                <>
                  <Lock size={14} /> Ganti password
                </>
              )}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #e5e7eb",
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