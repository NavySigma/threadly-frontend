import { Link, useNavigate, useParams } from "react-router-dom";
import { usePostDetail } from "../../hooks/usePostDetail";
import { useAuth } from "../../hooks/useAuth";
import CommentSection from "../../components/post/CommentSection";
import PostVote from "../post/vote/PostVote";
import PostLike from "../post/like/PostLike";
import { PostActionMenu } from "../profile/PostActionMenu";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { post, isLoading, error, refetch } = usePostDetail(id!);

  if (isLoading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#6a737c" }}>
        Memuat postingan...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#c0392b" }}>
        {error ?? "Postingan tidak ditemukan."}
      </div>
    );
  }

  const isOwner = user?.id === post.user.id;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6a737c",
            fontSize: 14,
            padding: 0,
          }}
        >
          ← Kembali
        </button>

        {isOwner && (
          <PostActionMenu
            postId={post.id}
            postStatus={post.status}
            closedAt={post.closed_at}
            onUpdated={refetch}
            onDeleted={() => navigate("/")}
          />
        )}
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
          lineHeight: 1.4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {post.status === "closed" && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
            }}
          >
            PRIVATE
          </span>
        )}
        {post.title}
      </h1>

      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 13,
          color: "#6a737c",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <span>Ditanya {timeAgo(post.created_at)}</span>
        <span>Dilihat {post.view_count}×</span>
        <span
          style={{
            color: post.status === "open" ? "#2e7d32" : "#c62828",
            fontWeight: 600,
          }}
        >
          {post.status === "closed" ? "PRIVATE" : post.status.toUpperCase()}
        </span>
        {post.is_answered && (
          <span style={{ color: "#2e7d32", fontWeight: 600 }}>✓ Terjawab</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Vote */}
        <PostVote postId={post.id} score={post.vote_score} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {post.body}
          </div>

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    background: tag.color ?? "#e1ecf4",
                    color: "#fff",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* Author */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#f0f4ff",
                padding: "10px 14px",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  overflow: "hidden",
                }}
              >
                {post.user.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.username}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  (post.user.username?.[0] ?? "?").toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {post.user.username}
                </div>
                <div style={{ fontSize: 12, color: "#6a737c" }}>
                  {timeAgo(post.created_at)}
                </div>
              </div>
            </div>

            {/* Like */}
            <PostLike postId={post.id} />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "12px 16px",
          background: "#f9fafb",
          borderRadius: 8,
          fontSize: 13,
          color: "#6a737c",
        }}
      >
        Kategori:{" "}
        <strong style={{ color: "#111827" }}>{post.category.name}</strong>
      </div>

      {/* Comment Section */}
      <CommentSection
        postId={post.id}
        postOwnerId={post.user.id}
        acceptedAnswerId={post.accepted_answer_id}
        postStatus={post.status}
      />
    </div>
  );
}
