import { useEffect, useState, type CSSProperties } from "react";
import { useFormik } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import { useEditProfile } from "../../../hooks/useEditProfile";
import type { ProfileFormValues } from "../../../types/profile.type";
import { ProfileSchema } from "./profile.validation.ts";

const fieldLabel: CSSProperties = {
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

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "U";
}

function Avatar({
  url,
  username,
  size = 64,
}: {
  url: string | null | undefined;
  username: string;
  size?: number;
}) {
  return (
    <div
      style={{
        borderRadius: 6,
        background: "#c084fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        color: "#fff",
        overflow: "hidden",
        flexShrink: 0,
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
          fontSize: 18,
          color: "inherit",
          opacity: 0.6,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ProfileFormik() {
  const { user, setUser } = useAuth();
  const { isLoading, error, success, submit, reset } = useEditProfile();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.avatar_url ?? null,
  );

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
      reset();
      const payload: Record<string, string | null | undefined> = {};
      if (values.username !== user?.username)
        payload.username = values.username;
      if (values.bio !== (user?.bio ?? "")) payload.bio = values.bio || null;
      if (values.avatar_url !== (user?.avatar_url ?? ""))
        payload.avatar_url = values.avatar_url || null;
      if (Object.keys(payload).length === 0) return;

      const updated = await submit(payload);
      if (updated) {
        setUser(updated);
        formik.setValues({
          username: updated.username,
          bio: updated.bio ?? "",
          avatar_url: updated.avatar_url ?? "",
        });
        setPreviewUrl(updated.avatar_url ?? null);
      }
    },
  });

  useEffect(() => {
    const trimmed = formik.values.avatar_url.trim();
    const timeout = setTimeout(() => {
      setPreviewUrl(trimmed || null);
    }, 600);
    return () => clearTimeout(timeout);
  }, [formik.values.avatar_url]);

  const charLeft = 500 - formik.values.bio.length;

  return (
    <form
      onSubmit={formik.handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Avatar
          url={previewUrl}
          username={formik.values.username || "U"}
          size={64}
        />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
        >
          <label style={fieldLabel}>Foto profil</label>
          <input
            type="url"
            name="avatar_url"
            placeholder="https://example.com/photo.jpg"
            value={formik.values.avatar_url}
            onChange={formik.handleChange}
            style={inputStyle}
          />
          {formik.touched.avatar_url && formik.errors.avatar_url ? (
            <span style={{ fontSize: 12, color: "#ef4444" }}>
              {formik.errors.avatar_url}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Paste URL gambar profil kamu
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={fieldLabel}>Username</label>
        <input
          type="text"
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          minLength={3}
          maxLength={100}
          required
          style={inputStyle}
        />
        {formik.touched.username && formik.errors.username && (
          <span style={{ fontSize: 12, color: "#ef4444" }}>
            {formik.errors.username}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={fieldLabel}>Bio</label>
        <textarea
          name="bio"
          value={formik.values.bio}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          maxLength={500}
          rows={4}
          placeholder="Ceritain sedikit tentang diri kamu..."
          style={{ ...inputStyle, resize: "vertical" }}
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
          ...saveBtnStyle,
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
