import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { apiFetch } from "../../api/client";
import { timeAgo } from "../../utils/dateUtils";

interface CommentItem {
  id: string;
  body: string;
  created_at: string;
  post: { id: string; title: string };
}

export function AnswersTab({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-comments", userId],
    queryFn: () =>
      apiFetch<{ data: CommentItem[] }>(`/users/${userId}/comments`),
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div style={{ padding: "20px 0", color: "#6b7280", fontSize: 14 }}>
        Memuat jawaban...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "20px 0", color: "#dc2626", fontSize: 14 }}>
        Gagal memuat jawaban.
      </div>
    );

  const comments = data?.data ?? [];

  return (
    <div>
      <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 16px" }}>
        Answers ({comments.length})
      </p>
      {comments.length === 0 ? (
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
          Belum ada jawaban.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {comments.map((c) => (
            <Link
              key={c.id}
              to={`/posts/${c.post.id}#comment-${c.id}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
                background: "#fff",
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
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#f0fdfa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0d9488",
                  }}
                >
                  <MessageSquare size={16} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0d9488",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.post.title}
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
                  {c.body}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
                  {timeAgo(c.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
