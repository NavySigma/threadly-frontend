import { useNavigate } from "react-router-dom";
import { useMyPosts } from "../../../hooks/useMyPosts";
import { PostActionMenu } from "./PostActionMenu";
import { useAuth } from "../../../hooks/useAuth";
import type { UserPost } from "../../../types/userPost.type";

function timeAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return new Date(dateStr).toLocaleDateString("id-ID");
}

export default function QuestionsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    posts,
    isLoading,
    error,
    refetch,
  } = useMyPosts(user?.id);

  if (isLoading) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
        Memuat postingan...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px", background: "#fef2f2", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", background: "#f9fafb", borderRadius: 8, color: "#9ca3af", fontSize: 14 }}>
        Kamu belum pernah membuat postingan.
      </div>
    );
  }

  return (
    <div>
      <p
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 12,
        }}
      >
        {posts.length} pertanyaan
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {posts.map((post: UserPost) => (
          <div
            key={post.id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "14px 16px",
              position: "relative",
              opacity: post.status === "closed" ? 0.75 : 1,
              transition: "opacity .2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <PostActionMenu
                postId={post.id}
                isPrivate={post.status !== "open"}
                onDeleted={() => refetch()}
                onPrivate={async () => {
                  refetch();
                }}
              />

              <div style={{ display: "flex", gap: 6 }}>
                {post.status === "closed" && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fef2f2", color: "#dc2626" }}>
                    🔒 Closed
                  </span>
                )}
                {post.is_answered && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a" }}>
                    ✓ Answered
                  </span>
                )}
              </div>
            </div>

            <h3
              onClick={() => navigate(`/posts/${post.id}`)}
              style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "#2563eb", cursor: "pointer", lineHeight: 1.4 }}
            >
              {post.title}
            </h3>

            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>
              {post.body.length > 120 ? `${post.body.slice(0, 120)}...` : post.body}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: tag.color ?? "#e5e7eb", color: tag.color ? "#fff" : "#374151", fontWeight: 500 }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af" }}>
              <span>{post.vote_score} votes</span>
              <span>{post.view_count} views</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
